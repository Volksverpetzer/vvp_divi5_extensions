<?php
/**
 * Lets the deploy workflow clear Divi's static CSS cache (wp-content/et-cache/)
 * over HTTP instead of over the SSH/rrsync deploy key.
 *
 * The deploy key is locked to rrsync (no shell access), and even an rsync
 * --delete trick against et-cache/ can't actually unlink anything in there:
 * Divi (re)creates every et-cache/{id}/ subdirectory as www-data with mode
 * 0755 on the next page view, and POSIX resets that directory's ACL mask to
 * the requested mode's group bits on every mkdir()/chmod() -- so no ACL grant
 * or group membership handed to the deploy account survives past the first
 * cache rebuild; only the owning user (www-data) ever has write access.
 * PHP itself runs as www-data, so it's the only thing that can reliably
 * delete these files -- this endpoint lets the deploy workflow ask PHP to do
 * it instead of trying to do it directly over SSH.
 *
 * Authenticated by a shared secret rather than a nonce -- there's no logged-in
 * WP user on the calling side, this is a server-to-server request from CI --
 * sent as a header and compared with hash_equals() to avoid timing leaks.
 * Nothing about the request is user-controlled beyond that secret: the path
 * cleared is always wp-content/et-cache/, never derived from request input.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VVP_Et_Cache_Clear_Endpoint {

	const ROUTE_NAMESPACE = 'vvp-divi5/v1';
	const ROUTE           = '/clear-et-cache';
	const SECRET_HEADER   = 'X-VVP-Cache-Clear-Secret';

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_route' ) );
	}

	public static function register_route() {
		register_rest_route(
			self::ROUTE_NAMESPACE,
			self::ROUTE,
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle_request' ),
				'permission_callback' => array( __CLASS__, 'check_secret' ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request
	 * @return bool
	 */
	public static function check_secret( $request ) {
		// Fail closed: an unconfigured secret must never fall back to "open".
		if ( ! defined( 'VVP_ET_CACHE_CLEAR_SECRET' ) || '' === VVP_ET_CACHE_CLEAR_SECRET ) {
			return false;
		}

		$provided = $request->get_header( self::SECRET_HEADER );

		return is_string( $provided ) && hash_equals( VVP_ET_CACHE_CLEAR_SECRET, $provided );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function handle_request() {
		$et_cache_dir = rtrim( WP_CONTENT_DIR, '/' ) . '/et-cache';

		if ( ! is_dir( $et_cache_dir ) ) {
			return new WP_REST_Response(
				array(
					'cleared' => 0,
					'note'    => 'et-cache directory does not exist -- nothing to clear.',
				),
				200
			);
		}

		return new WP_REST_Response(
			array( 'cleared' => self::clear_directory_contents( $et_cache_dir ) ),
			200
		);
	}

	/**
	 * Deletes everything inside $dir except top-level dotfiles -- matching
	 * the semantics of the `rm -rf et-cache/*` shell glob this replaces --
	 * but recurses into subdirectories fully, including their own dotfiles,
	 * exactly as `rm -rf` on a glob-matched subdirectory would.
	 *
	 * @param string $dir
	 * @return int Number of files deleted.
	 */
	private static function clear_directory_contents( $dir ) {
		$count   = 0;
		$entries = scandir( $dir );

		foreach ( $entries as $entry ) {
			if ( '.' === $entry || '..' === $entry || '.' === $entry[0] ) {
				continue;
			}

			$path = $dir . '/' . $entry;

			if ( is_dir( $path ) && ! is_link( $path ) ) {
				$count += self::delete_directory_recursive( $path );
			} elseif ( unlink( $path ) ) {
				++$count;
			}
		}

		return $count;
	}

	/**
	 * @param string $dir
	 * @return int Number of files deleted.
	 */
	private static function delete_directory_recursive( $dir ) {
		$count   = 0;
		$entries = scandir( $dir );

		foreach ( $entries as $entry ) {
			if ( '.' === $entry || '..' === $entry ) {
				continue;
			}

			$path = $dir . '/' . $entry;

			if ( is_dir( $path ) && ! is_link( $path ) ) {
				$count += self::delete_directory_recursive( $path );
			} elseif ( unlink( $path ) ) {
				++$count;
			}
		}

		rmdir( $dir );

		return $count;
	}
}
