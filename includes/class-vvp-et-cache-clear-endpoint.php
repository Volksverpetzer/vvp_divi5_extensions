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
 * Served through admin-ajax.php rather than the REST API: the site rejects
 * anonymous REST requests wholesale (rest_cannot_access, 401), before a
 * route's own permission_callback ever runs, while admin-ajax.php accepts
 * anonymous POSTs.
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

	const ACTION        = 'vvp_clear_et_cache';
	const SECRET_HEADER = 'HTTP_X_VVP_CACHE_CLEAR_SECRET'; // $_SERVER key for X-VVP-Cache-Clear-Secret.

	public static function init() {
		add_action( 'wp_ajax_nopriv_' . self::ACTION, array( __CLASS__, 'handle_request' ) );
	}

	/**
	 * @return bool
	 */
	private static function is_authorized() {
		// Fail closed: an unconfigured secret must never fall back to "open".
		if ( ! defined( 'VVP_ET_CACHE_CLEAR_SECRET' ) || '' === VVP_ET_CACHE_CLEAR_SECRET ) {
			return false;
		}

		if ( ! isset( $_SERVER['REQUEST_METHOD'], $_SERVER[ self::SECRET_HEADER ] ) || 'POST' !== $_SERVER['REQUEST_METHOD'] ) {
			return false;
		}

		$provided = wp_unslash( $_SERVER[ self::SECRET_HEADER ] );

		return is_string( $provided ) && hash_equals( VVP_ET_CACHE_CLEAR_SECRET, $provided );
	}

	public static function handle_request() {
		if ( ! self::is_authorized() ) {
			wp_send_json_error( array( 'message' => 'Forbidden' ), 403 );
		}

		$et_cache_dir = rtrim( WP_CONTENT_DIR, '/' ) . '/et-cache';

		if ( ! is_dir( $et_cache_dir ) ) {
			wp_send_json_success(
				array(
					'cleared' => 0,
					'note'    => 'et-cache directory does not exist -- nothing to clear.',
				)
			);
		}

		$failed  = 0;
		$cleared = self::clear_directory( $et_cache_dir, true, $failed );

		// Loud failure: a partial clear must turn the deploy step red rather than
		// report success while stale CSS is still being served.
		if ( $failed > 0 ) {
			wp_send_json_error(
				array(
					'message' => 'Some et-cache entries could not be deleted.',
					'cleared' => $cleared,
					'failed'  => $failed,
				),
				500
			);
		}

		wp_send_json_success( array( 'cleared' => $cleared ) );
	}

	/**
	 * Deletes everything inside $dir. At the top level, dotfiles are skipped --
	 * matching the `rm -rf et-cache/*` shell glob this replaces -- but
	 * subdirectories are cleared fully, including their own dotfiles, exactly
	 * as `rm -rf` on a glob-matched subdirectory would.
	 *
	 * @param string $dir
	 * @param bool   $skip_dotfiles
	 * @param int    $failed         Incremented for every entry that still exists after a delete attempt.
	 * @return int Number of files deleted.
	 */
	private static function clear_directory( $dir, $skip_dotfiles, &$failed ) {
		$entries = scandir( $dir );

		if ( false === $entries ) {
			++$failed;
			return 0;
		}

		$count = 0;

		foreach ( $entries as $entry ) {
			if ( '.' === $entry || '..' === $entry || ( $skip_dotfiles && '.' === $entry[0] ) ) {
				continue;
			}

			$path = $dir . '/' . $entry;

			if ( is_dir( $path ) && ! is_link( $path ) ) {
				$count += self::clear_directory( $path, false, $failed );

				// A failed rmdir() is deliberately not counted: "not empty" here means
				// Divi wrote a fresh file after our scan, which is harmless. Real
				// permission problems surface as failed unlink()s above instead.
				rmdir( $path );
			} elseif ( unlink( $path ) ) {
				++$count;
			} elseif ( file_exists( $path ) || is_link( $path ) ) {
				++$failed; // Still there -- not merely deleted concurrently by Divi.
			}
		}

		return $count;
	}
}
