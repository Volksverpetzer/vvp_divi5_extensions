<?php
/**
 * Fragment-caches specific Divi block types via WordPress core's
 * pre_render_block / render_block filters (official since WP 5.7).
 *
 * Why this exists: et_get_attachment_id_by_url() in Divi's own theme files
 * runs a raw, uncached $wpdb query with no filter hook available to
 * intercept it directly. Caching at the block level sidesteps that
 * entirely: whatever Divi does internally to render the block, we only pay
 * for it once per TTL window, regardless of which internal function is slow.
 *
 * Scope note: this covers RENDER-time work only. Divi resolves Dynamic
 * Content (including get_most_used_meta_keys_by_type()) during block
 * PARSING, before pre_render_block fires — that path is handled by
 * VVP_Dynamic_Content_Meta_Keys_Cache instead (see
 * class-vvp-dynamic-content-meta-keys-cache.php).
 *
 * SAFETY:
 *  - Skips entirely in wp-admin, REST requests, and Divi's Visual Builder
 *    so editing is never served stale/cached content.
 *  - Skips for logged-in users by default (matches existing Bunny edge
 *    rules that bypass cache for logged-in cookies).
 *  - Each cache entry stores the post's post_modified_gmt; on read a
 *    mismatch marks the entry stale, so saving/updating the post
 *    invalidates its cached blocks without an explicit purge.
 *
 * STAMPEDE PROTECTION (same pattern as the PR #74 ContentOverview fix):
 *  - Entries carry a soft TTL (with jitter) and stay stored for a grace
 *    window beyond it. When an entry goes stale — soft TTL passed or the
 *    post was updated — exactly one request acquires an atomic
 *    wp_cache_add() lock and re-renders; every other concurrent request
 *    keeps serving the stale fragment. A hot key can therefore never send
 *    the whole FPM pool down the slow render path at once. Only a truly
 *    cold key (first deploy / full cache flush) is rendered by everyone,
 *    which is the pre-cache status quo.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VVP_Block_Render_Cache {

	const CACHE_GROUP      = 'vvp_block_render';
	const CACHE_TTL        = 30 * MINUTE_IN_SECONDS;
	const CACHE_TTL_JITTER = 10 * MINUTE_IN_SECONDS;

	/**
	 * How long a stale fragment stays stored (and servable) past its soft
	 * TTL while a single lock-holding request re-renders it.
	 */
	const STALE_GRACE = 10 * MINUTE_IN_SECONDS;

	/**
	 * Refresh lock TTL in seconds — an upper bound on one re-render, so a
	 * crashed lock holder cannot block refreshes for long.
	 */
	const LOCK_TTL = 30;

	/**
	 * Divi 5's registered block name for the Image module, confirmed against
	 * the @divi/module-library and @divi/types packages this plugin builds
	 * against (node_modules/@divi/types/src/module/state/index.ts).
	 *
	 * Note: Divi 5 has no dedicated "loop item" block — the Loop Builder is a
	 * settings-options group ('divi/loop') applied to a host module, so each
	 * repeated loop item renders as that module's own block (here: the Image
	 * module). If other modules show up in the slow log later, verify their
	 * block names on the server before adding them:
	 *
	 * wp eval 'foreach (array_keys(WP_Block_Type_Registry::get_instance()->get_all_registered()) as $n) { if (stripos($n,"divi")!==false) echo $n . PHP_EOL; }'
	 */
	const TARGET_BLOCKS = array(
		'divi/image',
	);

	const CACHE_LOGGED_IN_USERS = false;

	public static function init() {
		add_filter( 'pre_render_block', array( __CLASS__, 'maybe_serve_cached' ), PHP_INT_MAX, 2 );
		// The cache write must capture the FINAL rendered output, because cached
		// fragments are served via pre_render_block, which bypasses the whole
		// render_block filter chain. Core applies render_block_{name} after all
		// generic render_block filters, so hooking there at PHP_INT_MAX caches
		// the block as every other filter would have delivered it.
		foreach ( self::TARGET_BLOCKS as $block_name ) {
			add_filter( "render_block_{$block_name}", array( __CLASS__, 'maybe_cache_result' ), PHP_INT_MAX, 2 );
		}
	}

	private static function is_cacheable_request() {
		if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return false;
		}
		if ( function_exists( 'et_core_is_fb_enabled' ) && et_core_is_fb_enabled() ) {
			return false;
		}
		if ( ! self::CACHE_LOGGED_IN_USERS && is_user_logged_in() ) {
			return false;
		}
		return true;
	}

	public static function maybe_serve_cached( $pre_render, $parsed_block ) {
		if ( null !== $pre_render ) {
			return $pre_render; // Another pre_render_block callback already short-circuited.
		}
		if ( ! in_array( $parsed_block['blockName'], self::TARGET_BLOCKS, true ) ) {
			return $pre_render;
		}
		if ( ! self::is_cacheable_request() ) {
			return $pre_render;
		}

		$key   = self::cache_key( $parsed_block );
		$entry = wp_cache_get( $key, self::CACHE_GROUP );
		if ( ! is_array( $entry ) || ! array_key_exists( 'content', $entry ) ) {
			return $pre_render; // Cold miss — nothing servable; render and cache.
		}

		$fresh = time() < $entry['soft_expires'] && self::current_modified() === $entry['modified'];
		if ( $fresh ) {
			return $entry['content'];
		}

		// Stale (soft TTL passed or the post was updated since it was cached):
		// exactly one request re-renders, everyone else keeps serving the stale
		// fragment. wp_cache_add() is atomic — it fails if the key exists.
		if ( wp_cache_add( 'lock_' . $key, 1, self::CACHE_GROUP, self::LOCK_TTL ) ) {
			return $pre_render; // We hold the lock — render fresh; maybe_cache_result() stores and releases.
		}
		return $entry['content'];
	}

	public static function maybe_cache_result( $block_content, $parsed_block ) {
		if ( ! in_array( $parsed_block['blockName'], self::TARGET_BLOCKS, true ) ) {
			return $block_content;
		}
		if ( ! self::is_cacheable_request() ) {
			return $block_content;
		}

		$key      = self::cache_key( $parsed_block );
		$soft_ttl = self::CACHE_TTL + wp_rand( 0, self::CACHE_TTL_JITTER );
		$entry    = array(
			'content'      => $block_content,
			'modified'     => self::current_modified(),
			'soft_expires' => time() + $soft_ttl,
		);
		// Always overwrite: a stale entry must not block its own refresh, and
		// the freshest render winning is correct in every race.
		wp_cache_set( $key, $entry, self::CACHE_GROUP, $soft_ttl + self::STALE_GRACE );
		wp_cache_delete( 'lock_' . $key, self::CACHE_GROUP );
		return $block_content;
	}

	private static function cache_key( $parsed_block ) {
		$attrs_hash = md5( wp_json_encode( $parsed_block['attrs'] ?? array() ) );
		$block      = sanitize_key( str_replace( '/', '_', $parsed_block['blockName'] ) );

		$post_id = get_the_ID() ?: 0;
		if ( $post_id ) {
			return sprintf( 'post_%d_block_%s_%s', $post_id, $block, $attrs_hash );
		}

		// No global post (template parts, non-singular queries): key on the
		// queried object so different pages never share a post_0 namespace.
		// The class name disambiguates — term, user and post IDs are separate
		// ID namespaces that would otherwise collide.
		$queried = get_queried_object();
		if ( $queried ) {
			$queried_id = get_queried_object_id();
			if ( ! $queried_id && isset( $queried->name ) ) {
				$queried_id = $queried->name; // Post-type archives have no numeric ID.
			}
			$context = sanitize_key( str_replace( '\\', '_', strtolower( get_class( $queried ) ) ) ) . '_' . $queried_id;
		} else {
			$context = 'uri_' . md5( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ) );
		}
		return sprintf( 'query_%s_block_%s_%s', $context, $block, $attrs_hash );
	}

	/**
	 * Current post's modification stamp, stored in the entry and compared on
	 * read; a mismatch marks the entry stale. Digits only ("2026-07-02
	 * 12:34:56" -> "20260702123456") so the format stays cache-key-safe.
	 */
	private static function current_modified() {
		$post_id = get_the_ID() ?: 0;
		return $post_id ? preg_replace( '/[^0-9]/', '', (string) get_post_field( 'post_modified_gmt', $post_id ) ) : '';
	}
}
