<?php
/**
 * Caches WordPress core's attachment_url_to_postid() lookups via the official
 * pre_attachment_url_to_postid short-circuit filter (WP 6.7+).
 *
 * Scope: covers core's attachment_url_to_postid() only — including the direct
 * call Divi's Loop Builder makes at ModuleElementsUtils.php:345. It does NOT
 * cover Divi's own duplicate query in et_get_attachment_id_by_url() (that's
 * handled separately by VVP_Block_Render_Cache, see class-vvp-block-render-cache.php).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VVP_Attachment_URL_Cache {

	const CACHE_GROUP        = 'vvp_attach_url';
	const CACHE_TTL          = 6 * HOUR_IN_SECONDS;
	const CACHE_TTL_JITTER   = 2 * HOUR_IN_SECONDS;
	const NOT_FOUND_SENTINEL = 'vvp_not_found';

	public static function init() {
		global $wp_version;
		if ( version_compare( $wp_version, '6.7', '<' ) ) {
			add_action( 'admin_notices', array( __CLASS__, 'admin_notice_unsupported' ) );
			return;
		}
		add_filter( 'pre_attachment_url_to_postid', array( __CLASS__, 'pre_lookup' ), 10, 2 );
		add_filter( 'attachment_url_to_postid', array( __CLASS__, 'cache_result' ), 10, 2 );
	}

	public static function admin_notice_unsupported() {
		echo '<div class="notice notice-warning"><p><strong>VVP_Attachment_URL_Cache</strong> is inactive: requires WordPress 6.7+ for the <code>pre_attachment_url_to_postid</code> filter.</p></div>';
	}

	public static function pre_lookup( $post_id, $url ) {
		if ( null !== $post_id ) {
			return $post_id; // Another pre_attachment_url_to_postid callback already short-circuited.
		}
		$cached = wp_cache_get( self::cache_key( $url ), self::CACHE_GROUP );
		if ( false === $cached ) {
			return null; // Not cached — let core run its query.
		}
		return ( self::NOT_FOUND_SENTINEL === $cached ) ? 0 : (int) $cached;
	}

	public static function cache_result( $post_id, $url ) {
		$key = self::cache_key( $url );
		if ( false !== wp_cache_get( $key, self::CACHE_GROUP ) ) {
			return $post_id; // Already cached (served from our own short-circuit).
		}
		$ttl   = self::CACHE_TTL + wp_rand( 0, self::CACHE_TTL_JITTER );
		$value = $post_id ? $post_id : self::NOT_FOUND_SENTINEL;
		wp_cache_set( $key, $value, self::CACHE_GROUP, $ttl );
		return $post_id;
	}

	private static function cache_key( $url ) {
		return 'url_' . md5( $url );
	}
}
