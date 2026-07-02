<?php
/**
 * Stale-while-revalidate shim over Divi's "most used meta keys" transients.
 *
 * Root cause (FPM slow log, 2026-07-02): Divi builder-5 resolves Dynamic
 * Content during block PARSING (BlockParser::parse() via parse_blocks()),
 * which builds every dynamic-content option — including
 * DynamicContentOptions::get_most_used_meta_keys_by_type(), an unindexable
 * GROUP BY / HAVING scan over the whole postmeta table. Divi caches the
 * result in a transient for only 5 minutes with no lock and no stale
 * serving, so every 5 minutes ALL concurrent requests miss together and
 * each re-runs the 5+ second scan (up to three times: post/user/term)
 * until one finishes — saturating the whole FPM pool. has_user_cap() gates
 * only the 'user' type behind manage_options; 'post' and 'term' run for
 * anonymous visitors too. Parse-time means VVP_Block_Render_Cache
 * (pre_render_block) can never intercept it.
 *
 * The shim: keep a long-lived shadow copy of each transient in the object
 * cache. get_transient() fires the official pre_transient_{key} filter —
 * while the shadow is fresh we short-circuit there, so Divi's 5-minute
 * transient and its query are never consulted. When the shadow goes stale,
 * exactly one request wins an atomic wp_cache_add() lock and falls through
 * to Divi's normal path (transient miss -> query -> set_transient); the
 * set_transient_{key} action captures the fresh result into the shadow and
 * releases the lock. Every other request keeps serving the stale list.
 * The transient_{key} filter backfills the shadow when a still-valid real
 * transient is read (first request after deploy). Same single-flight
 * pattern as the PR #74 ContentOverview fix.
 *
 * Staleness is benign: the list only feeds the builder's meta-key dropdown
 * and option defaults. A brand-new (non-ACF) meta key can take up to
 * CACHE_TTL + jitter to appear there — ACF fields are unaffected, Divi
 * fetches those uncached right next to this ("to ensure immediate
 * visibility"). Divi's per-post variant
 * (divi_module_dynamic_content_most_used_meta_keys_{$post_id}) is NOT
 * shimmed: its keys are dynamic, its query is bounded to one post, and it
 * has never appeared in the slow log.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VVP_Dynamic_Content_Meta_Keys_Cache {

	const CACHE_GROUP = 'vvp_dc_meta_keys';

	/**
	 * Soft TTL of the shadow copy. The stampede fix is the single-flight
	 * lock, not the TTL — but re-running an unindexable postmeta scan every
	 * 5 minutes (Divi's default) is pointless for a list that rarely
	 * changes. One hour keeps new meta keys reasonably visible to editors.
	 */
	const CACHE_TTL        = HOUR_IN_SECONDS;
	const CACHE_TTL_JITTER = 15 * MINUTE_IN_SECONDS;

	/**
	 * How long a stale shadow stays servable past its soft TTL while
	 * refreshes happen (or repeatedly fail).
	 */
	const STALE_GRACE = 12 * HOUR_IN_SECONDS;

	/**
	 * Refresh lock TTL in seconds — an upper bound on one query run, so a
	 * crashed lock holder cannot block refreshes for long.
	 */
	const LOCK_TTL = 60;

	/**
	 * Divi's transient names, verified against the theme source on the
	 * server (DynamicContentOptions.php:203/268 builds
	 * "divi_module_dynamic_content_most_used_{$meta_type}_meta_keys" for
	 * post/user/term; :289/315 uses the untyped variant). All four cache
	 * the same class of site-wide postmeta/usermeta/termmeta scans.
	 */
	const TRANSIENT_KEYS = array(
		'divi_module_dynamic_content_most_used_post_meta_keys',
		'divi_module_dynamic_content_most_used_user_meta_keys',
		'divi_module_dynamic_content_most_used_term_meta_keys',
		'divi_module_dynamic_content_most_used_meta_keys',
	);

	public static function init() {
		foreach ( self::TRANSIENT_KEYS as $key ) {
			add_filter( "pre_transient_{$key}", array( __CLASS__, 'pre_get' ), PHP_INT_MAX );
			add_filter( "transient_{$key}", array( __CLASS__, 'backfill' ), PHP_INT_MAX );
			add_action( "set_transient_{$key}", array( __CLASS__, 'capture' ), 10, 1 );
		}
	}

	/**
	 * Short-circuits get_transient() while the shadow copy is fresh; on a
	 * stale shadow lets exactly one request through to refresh.
	 */
	public static function pre_get( $pre ) {
		if ( false !== $pre ) {
			return $pre; // Another pre_transient callback already short-circuited.
		}

		$key    = self::key_from_filter( 'pre_transient_' );
		$shadow = wp_cache_get( $key, self::CACHE_GROUP );
		if ( ! is_array( $shadow ) || ! array_key_exists( 'value', $shadow ) || ! isset( $shadow['soft_expires'] ) ) {
			return false; // No shadow yet (or old/corrupt format) — normal path; backfill()/capture() will store it.
		}

		if ( time() < $shadow['soft_expires'] ) {
			return $shadow['value'];
		}

		// Stale: one request refreshes via Divi's normal path (transient
		// miss -> query -> set_transient -> capture()); everyone else keeps
		// serving the stale list. wp_cache_add() is atomic.
		if ( wp_cache_add( 'lock_' . $key, 1, self::CACHE_GROUP, self::LOCK_TTL ) ) {
			return false;
		}
		return $shadow['value'];
	}

	/**
	 * Runs after a real transient read (only reachable when pre_get()
	 * returned false): if Divi's own transient was still valid, adopt its
	 * value so the next read short-circuits.
	 */
	public static function backfill( $value ) {
		if ( false !== $value ) {
			self::store( self::key_from_filter( 'transient_' ), $value );
		}
		return $value;
	}

	/**
	 * Captures the fresh query result whenever Divi writes its transient.
	 */
	public static function capture( $value ) {
		self::store( self::key_from_filter( 'set_transient_' ), $value );
	}

	private static function store( $key, $value ) {
		$soft_ttl = self::CACHE_TTL + wp_rand( 0, self::CACHE_TTL_JITTER );
		$shadow   = array(
			'value'        => $value,
			'soft_expires' => time() + $soft_ttl,
		);
		wp_cache_set( $key, $shadow, self::CACHE_GROUP, $soft_ttl + self::STALE_GRACE );
		wp_cache_delete( 'lock_' . $key, self::CACHE_GROUP );
	}

	/**
	 * The transient name, recovered from the current hook so all keys can
	 * share the same static callbacks.
	 */
	private static function key_from_filter( $prefix ) {
		return substr( current_filter(), strlen( $prefix ) );
	}
}
