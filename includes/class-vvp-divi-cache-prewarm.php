<?php
/**
 * Pre-warms Divi's per-post dynamic CSS cache (/wp-content/et-cache/{post_id}/...)
 * immediately after a post's content goes live — on first publish, and again on
 * any later edit of an already-published post — instead of leaving it to
 * whichever visitor's request happens to hit the post first.
 *
 * Divi only (re)builds a post's et-cache files the first time that post's
 * permalink is actually rendered after a save — confirmed on prod 2026-09-10
 * (post 123389 published 09:42:59, et-cache files not written until 09:47:27,
 * the first real visitor hit). That first render is more expensive than a
 * normal cached one (full Divi CSS compilation on top of the page build).
 *
 * The same post also needs re-warming after later edits, not just the initial
 * publish: per project memory, WP Webhooks only re-indexes on create, but it
 * (like other save-time integrations) purges the BunnyCDN edge cache for that
 * URL on every update — so an editor fixing a typo on a live post throws away
 * the cached page just as surely as the first publish did. Confirmed on prod
 * 2026-09-10 on post 123389 (/analyse/mecklenburg-vorpommern-sicher/): a title
 * edit after publish purged Bunny's cached copy, and ~150 near-simultaneous
 * fediverse link-preview fetches (Mastodon boosts, ?utm_source=mstdn, all
 * within a ~26s window per nginx access log timestamps 09:57:35-09:58:01) hit
 * the now-uncached URL and all failed with 499 — origin couldn't keep up with
 * the concurrent cache-miss pile-up (load average 13.86 shortly after).
 *
 * Either way, several geographically distributed BunnyCDN edge PoPs can
 * independently cold-miss the same not-yet-cached post within seconds of each
 * other and hit origin concurrently, each racing to trigger the same expensive
 * work before the first one finishes and the edge cache picks up the result.
 *
 * Firing one deliberate internal request to the permalink right after the post
 * goes live (or is re-saved while live) makes that work happen once,
 * server-side, before any of that real traffic arrives. The request is fired
 * from a scheduled event a few seconds out (rather than inline, synchronously)
 * so that whatever purges the Bunny edge cache for this URL on save — the
 * WP Webhooks integration, for the update case — has time to actually run and
 * propagate first; firing immediately risks the warm request landing on an
 * edge PoP that hasn't purged yet, which would just re-serve the stale cached
 * page instead of reaching origin and rebuilding Divi's et-cache.
 *
 * Relies on WP-Cron's normal pseudo-cron behavior (a scheduled event runs on
 * the next front-end page load at or after its timestamp, not at a guaranteed
 * wall-clock time) — accepted here rather than building a real job queue,
 * since this site's traffic volume is exactly what makes the underlying
 * problem (a race for the first render) real in the first place: some visitor
 * hitting *any* page routinely arrives well within the 15s delay. On a
 * near-zero-traffic property this degrades gracefully to the pre-patch
 * behavior (first real visitor triggers the compile) rather than failing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VVP_Divi_Cache_Prewarm {

	const CRON_HOOK      = 'vvp_divi_cache_prewarm';
	const SCHEDULE_DELAY = 15; // seconds; see class docblock for why this isn't fired inline.

	public static function init() {
		add_action( 'transition_post_status', array( __CLASS__, 'maybe_schedule_prewarm' ), 10, 3 );
		add_action( self::CRON_HOOK, array( __CLASS__, 'prewarm' ) );
	}

	/**
	 * @param string  $new_status
	 * @param string  $_old_status Unused -- every 'publish' transition needs a warm
	 *                             request regardless of where the post came from.
	 * @param WP_Post $post
	 */
	public static function maybe_schedule_prewarm( $new_status, $_old_status, $post ) {
		// Revisions/autosaves never reach here (transition_post_status isn't fired for
		// them), but skip explicitly for clarity and in case of a future WP core change.
		if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
			return;
		}

		// Scoped to the post type actually used by the editorial workflow.
		if ( 'post' !== $post->post_type ) {
			return;
		}

		// Any transition that leaves the post live: the initial draft/pending->publish
		// move, and also publish->publish (an edit saved on an already-published post),
		// since either one purges the Bunny edge cache for the post's URL and leaves
		// Divi's et-cache stale/rebuilt-on-next-hit.
		if ( 'publish' !== $new_status ) {
			// The post moved away from publish (e.g. unpublished, or reverted to draft)
			// before a previously scheduled warm request fired -- cancel it rather than
			// let prewarm() request a URL that's no longer live.
			self::unschedule( $post->ID );
			return;
		}

		// Checked here rather than as a registry `condition` (evaluated at
		// `plugins_loaded` priority 5): on a Divi-as-theme install, the theme's
		// functions.php — where this is defined — loads after `plugins_loaded`,
		// so gating registration on it there would permanently disable this class.
		// By the time a post is actually saved, the theme is long since loaded.
		if ( ! function_exists( 'et_core_is_fb_enabled' ) ) {
			return;
		}

		// Reschedule rather than leaving an existing pending event alone: a second
		// edit within the delay window also purges the Bunny cache again, so the
		// warm request needs to move out from *that* save, not fire early relative
		// to it (which would just repeat the original race this delay exists to
		// avoid).
		self::unschedule( $post->ID );

		wp_schedule_single_event( time() + self::SCHEDULE_DELAY, self::CRON_HOOK, array( $post->ID ) );
	}

	/**
	 * Cron callback: fires the actual warm request, non-blocking either way.
	 *
	 * @param int $post_id
	 */
	public static function prewarm( $post_id ) {
		// Re-checked here, not just in maybe_schedule_prewarm(): Divi could be
		// deactivated in the gap between scheduling this event and it firing, which
		// would otherwise still send a request for a site that no longer has any
		// et-cache to warm.
		if ( ! function_exists( 'et_core_is_fb_enabled' ) ) {
			return;
		}

		// Same gap, different changes: the post's type could be swapped away from
		// 'post' between scheduling and firing (rare, but some plugins do allow it),
		// and the unschedule in maybe_schedule_prewarm() only stops an event that's
		// still queued -- it can't stop one WP-Cron has already dequeued and started
		// running at the moment a status change happens. Re-check both here too.
		$current = get_post( $post_id );
		if ( ! $current || 'post' !== $current->post_type || 'publish' !== $current->post_status ) {
			return;
		}

		$permalink = get_permalink( $post_id );
		if ( ! $permalink ) {
			return;
		}

		wp_remote_get(
			$permalink,
			array(
				'timeout'    => 0.5,
				'blocking'   => false,
				'user-agent' => 'VVP-DiviCachePrewarm/1.0',
			)
		);
	}

	private static function unschedule( $post_id ) {
		// wp_clear_scheduled_hook(), not wp_next_scheduled() + wp_unschedule_event():
		// the latter only removes a single matching event, so if two concurrent saves
		// of the same post ever raced past the check-then-schedule below without
		// seeing each other's event, one duplicate would survive every future
		// unschedule() call and still fire. Clearing all matching events closes that
		// gap regardless of how many ended up queued.
		wp_clear_scheduled_hook( self::CRON_HOOK, array( $post_id ) );
	}
}
