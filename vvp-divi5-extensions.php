<?php
/*
Plugin Name: Volksverpetzer DIVI 5 extensions
Plugin URI:  https://github.com/Volksverpetzer/vvp_divi5_extensions
Description: Adds the custom DIVI 5 extensions for Volksverpetzer.de to the site
Version:     1.0.7
Author:      Volksverpetzer
Author URI:  https://volksverpetzer.de
License:     GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Volksverpetzer DIVI 5 extensions is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.

Volksverpetzer DIVI 5 extensions is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Volksverpetzer DIVI 5 extensions. If not, see https://www.gnu.org/licenses/gpl-2.0.html.
*/

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

if ( defined( 'VVP_DIVI5_PATH' ) ) {
	return; // Another instance of this plugin is already loaded.
}

define( 'VVP_DIVI5_PATH', plugin_dir_path( __FILE__ ) );
define( 'VVP_DIVI5_URL', plugin_dir_url( __FILE__ ) );
define( 'VVP_DIVI5_VERSION', '1.0.7' );
define( 'VVP_DIVI5_JSON_PATH', VVP_DIVI5_PATH . 'modules-json/' );

/**
 * Requires module autoloader and Composer autoloader (if present).
 */
require_once VVP_DIVI5_PATH . 'modules/autoload.php';

if ( file_exists( VVP_DIVI5_PATH . 'vendor/autoload.php' ) ) {
	require VVP_DIVI5_PATH . 'vendor/autoload.php';
}

/**
 * Require module registration.
 */
require VVP_DIVI5_PATH . 'modules/Modules.php';

/**
 * Register cache-warming cron job for ContentOverview external API feeds.
 */
require_once VVP_DIVI5_PATH . 'modules/CronManager.php';

add_action( 'plugins_loaded', [ 'VVP\Divi5\CronManager', 'register' ] );
register_deactivation_hook( __FILE__, [ 'VVP\Divi5\CronManager', 'deactivate' ] );

/**
 * ContentOverview builds its article list from a local query cached for a few
 * minutes. Purge that transient whenever a post is published, edited or
 * unpublished so the feed reflects the change on the next page view.
 *
 * RelatedItems caches a post's own vectorcrawl recommendations (server-side
 * fetch result) for 6h. Purge that post's own cache on the same event, so a
 * one-off failed/empty fetch -- or a content change affecting its own card
 * data (title, thumbnail, excerpt) -- can self-heal by re-publishing/saving
 * the post, instead of silently sticking for up to 6h with no admin-facing
 * way to force a refresh.
 */
add_action( 'transition_post_status', function ( $new_status, $old_status, $post ) {
	if ( 'post' === $post->post_type && ( 'publish' === $new_status || 'publish' === $old_status ) ) {
		delete_transient( \VVP\Divi5\ContentOverview\ContentOverview::LOCAL_POSTS_TRANSIENT );
		delete_transient( \VVP\Divi5\RelatedItems\RelatedItems::cache_key( $post->ID ) );
	}
}, 10, 3 );

/**
 * Performance caches for Divi builder-5 render-path queries (uncached
 * Dynamic Content lookups that exhausted PHP-FPM). The attachment-URL
 * cache lives in the vvp_site_patches plugin (it patches WP core, not Divi).
 */
require_once VVP_DIVI5_PATH . 'includes/class-vvp-block-render-cache.php';
require_once VVP_DIVI5_PATH . 'includes/class-vvp-dynamic-content-meta-keys-cache.php';

add_action( 'plugins_loaded', [ 'VVP_Block_Render_Cache', 'init' ] );
add_action( 'plugins_loaded', [ 'VVP_Dynamic_Content_Meta_Keys_Cache', 'init' ] );

/**
 * Enqueue Visual Builder assets for DIVI 5.
 *
 * @since 1.0.0
 */
function VVP_DIVI5_enqueue_vb_scripts() {
	if ( et_builder_d5_enabled() && et_core_is_fb_enabled() ) {
		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-fact-check-builder-bundle-script',
				'version' => VVP_DIVI5_VERSION,
				'script'  => [
					'src'                => VVP_DIVI5_URL . 'scripts/bundle.js',
					'deps'               => [
						'divi-module-library',
						'divi-vendor-wp-hooks',
					],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-fact-check-builder-vb-bundle-style',
				'version' => VVP_DIVI5_VERSION,
				'style'   => [
					'src'                => VVP_DIVI5_URL . 'styles/main.css',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-content-overview-frontend-vb',
				'version' => VVP_DIVI5_VERSION,
				'script'  => [
					'src'                => VVP_DIVI5_URL . 'scripts/content-overview-frontend.js',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-author-profile-frontend-vb',
				'version' => VVP_DIVI5_VERSION,
				'script'  => [
					'src'                => VVP_DIVI5_URL . 'scripts/author-profile-frontend.js',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-trending-items-frontend-vb',
				'version' => VVP_DIVI5_VERSION,
				'script'  => [
					'src'                => VVP_DIVI5_URL . 'scripts/trending-items-frontend.js',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-trending-list-frontend-vb',
				'version' => VVP_DIVI5_VERSION,
				'script'  => [
					'src'                => VVP_DIVI5_URL . 'scripts/trending-list-frontend.js',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-related-items-frontend-vb',
				'version' => VVP_DIVI5_VERSION,
				'script'  => [
					'src'                => VVP_DIVI5_URL . 'scripts/related-items-frontend.js',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);
	}
}
add_action( 'divi_visual_builder_assets_before_enqueue_scripts', 'VVP_DIVI5_enqueue_vb_scripts' );

/**
 * Enqueue frontend styles and scripts.
 *
 * @since 1.0.0
 */
function VVP_DIVI5_enqueue_frontend_scripts() {
	wp_enqueue_style(
		'vvp-fact-check-bundle-style',
		VVP_DIVI5_URL . 'styles/main.css',
		array(),
		VVP_DIVI5_VERSION
	);

	$fc_frontend_path = VVP_DIVI5_PATH . 'scripts/fact-check-frontend.js';
	$fc_frontend_ver  = file_exists( $fc_frontend_path ) ? filemtime( $fc_frontend_path ) : VVP_DIVI5_VERSION;

	wp_enqueue_script(
		'vvp-fact-check-frontend',
		VVP_DIVI5_URL . 'scripts/fact-check-frontend.js',
		array(),
		$fc_frontend_ver,
		true
	);

	$co_frontend_path = VVP_DIVI5_PATH . 'scripts/content-overview-frontend.js';
	$co_frontend_ver  = file_exists( $co_frontend_path ) ? filemtime( $co_frontend_path ) : VVP_DIVI5_VERSION;

	wp_enqueue_script(
		'vvp-content-overview-frontend',
		VVP_DIVI5_URL . 'scripts/content-overview-frontend.js',
		array(),
		$co_frontend_ver,
		true
	);

	$ap_frontend_path = VVP_DIVI5_PATH . 'scripts/author-profile-frontend.js';
	$ap_frontend_ver  = file_exists( $ap_frontend_path ) ? filemtime( $ap_frontend_path ) : VVP_DIVI5_VERSION;

	wp_enqueue_script(
		'vvp-author-profile-frontend',
		VVP_DIVI5_URL . 'scripts/author-profile-frontend.js',
		array(),
		$ap_frontend_ver,
		true
	);

	$ti_frontend_path = VVP_DIVI5_PATH . 'scripts/trending-items-frontend.js';
	$ti_frontend_ver  = file_exists( $ti_frontend_path ) ? filemtime( $ti_frontend_path ) : VVP_DIVI5_VERSION;

	wp_enqueue_script(
		'vvp-trending-items-frontend',
		VVP_DIVI5_URL . 'scripts/trending-items-frontend.js',
		array(),
		$ti_frontend_ver,
		true
	);

	$tl_frontend_path = VVP_DIVI5_PATH . 'scripts/trending-list-frontend.js';
	$tl_frontend_ver  = file_exists( $tl_frontend_path ) ? filemtime( $tl_frontend_path ) : VVP_DIVI5_VERSION;

	wp_enqueue_script(
		'vvp-trending-list-frontend',
		VVP_DIVI5_URL . 'scripts/trending-list-frontend.js',
		array(),
		$tl_frontend_ver,
		true
	);

	$ri_frontend_path = VVP_DIVI5_PATH . 'scripts/related-items-frontend.js';
	$ri_frontend_ver  = file_exists( $ri_frontend_path ) ? filemtime( $ri_frontend_path ) : VVP_DIVI5_VERSION;

	wp_enqueue_script(
		'vvp-related-items-frontend',
		VVP_DIVI5_URL . 'scripts/related-items-frontend.js',
		array(),
		$ri_frontend_ver,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'VVP_DIVI5_enqueue_frontend_scripts' );
