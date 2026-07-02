<?php
/**
 * Fragment-caches specific Divi block types via WordPress core's
 * pre_render_block / render_block filters (official since WP 5.7).
 *
 * Why this exists: et_get_attachment_id_by_url() and
 * get_most_used_meta_keys_by_type() in Divi's own theme files run raw,
 * uncached $wpdb queries with no filter hook available to intercept them
 * directly. Caching at the block level sidesteps that entirely: whatever
 * Divi does internally to render the block, we only pay for it once per
 * TTL window, regardless of which internal function is slow.
 *
 * SAFETY:
 *  - Skips entirely in wp-admin, REST requests, and Divi's Visual Builder
 *    so editing is never served stale/cached content.
 *  - Skips for logged-in users by default (matches existing Bunny edge
 *    rules that bypass cache for logged-in cookies).
 *  - Cache key includes the post's post_modified_gmt, so saving/updating
 *    the post naturally invalidates its cached blocks without an explicit
 *    purge — old keys just age out via TTL, unused.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VVP_Block_Render_Cache {

	const CACHE_GROUP      = 'vvp_block_render';
	const CACHE_TTL        = 30 * MINUTE_IN_SECONDS;
	const CACHE_TTL_JITTER = 10 * MINUTE_IN_SECONDS;

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
		$key    = self::cache_key( $parsed_block );
		$cached = wp_cache_get( $key, self::CACHE_GROUP );
		return ( false === $cached ) ? $pre_render : $cached;
	}

	public static function maybe_cache_result( $block_content, $parsed_block ) {
		if ( ! in_array( $parsed_block['blockName'], self::TARGET_BLOCKS, true ) ) {
			return $block_content;
		}
		if ( ! self::is_cacheable_request() ) {
			return $block_content;
		}
		$key = self::cache_key( $parsed_block );
		if ( false !== wp_cache_get( $key, self::CACHE_GROUP ) ) {
			return $block_content;
		}
		$ttl = self::CACHE_TTL + wp_rand( 0, self::CACHE_TTL_JITTER );
		wp_cache_set( $key, $block_content, self::CACHE_GROUP, $ttl );
		return $block_content;
	}

	private static function cache_key( $parsed_block ) {
		$post_id = get_the_ID() ?: 0;
		// Digits only ("2026-07-02 12:34:56" -> "20260702123456"): some object
		// cache backends (Memcached) reject keys containing spaces.
		$last_modified = $post_id ? preg_replace( '/[^0-9]/', '', get_post_field( 'post_modified_gmt', $post_id ) ) : '';
		$attrs_hash    = md5( wp_json_encode( $parsed_block['attrs'] ?? array() ) );
		return sprintf(
			'post_%d_mod_%s_block_%s_%s',
			$post_id,
			$last_modified,
			sanitize_key( str_replace( '/', '_', $parsed_block['blockName'] ) ),
			$attrs_hash
		);
	}
}
