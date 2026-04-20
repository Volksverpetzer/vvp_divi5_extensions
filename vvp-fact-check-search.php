<?php
/*
Plugin Name: Faktencheck Suche für DIVI 5
Plugin URI:  https://volksverpetzer.de
Description: Adds the Volksverpetzer Faktencheck search bar as a DIVI 5 module. Searches the fact-check archive by text, quote or URL.
Version:     1.0.0
Author:      Volksverpetzer
Author URI:  https://volksverpetzer.de
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: vvp-fact-check-search
Domain Path: /languages

Faktencheck Suche für DIVI 5 is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.

Faktencheck Suche für DIVI 5 is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Faktencheck Suche für DIVI 5. If not, see https://www.gnu.org/licenses/gpl-2.0.html.
*/

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

define( 'VVP_FACT_CHECK_PATH', plugin_dir_path( __FILE__ ) );
define( 'VVP_FACT_CHECK_URL', plugin_dir_url( __FILE__ ) );
define( 'VVP_FACT_CHECK_VERSION', '1.0.0' );
define( 'VVP_FACT_CHECK_JSON_PATH', VVP_FACT_CHECK_PATH . 'modules-json/' );

/**
 * Requires module autoloader and Composer autoloader (if present).
 */
require_once VVP_FACT_CHECK_PATH . 'modules/autoload.php';

if ( file_exists( VVP_FACT_CHECK_PATH . 'vendor/autoload.php' ) ) {
	require VVP_FACT_CHECK_PATH . 'vendor/autoload.php';
}

/**
 * Require module registration.
 */
require VVP_FACT_CHECK_PATH . 'modules/Modules.php';

/**
 * Enqueue Visual Builder assets for DIVI 5.
 *
 * @since 1.0.0
 */
function vvp_fact_check_enqueue_vb_scripts() {
	if ( et_builder_d5_enabled() && et_core_is_fb_enabled() ) {
		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-fact-check-builder-bundle-script',
				'version' => VVP_FACT_CHECK_VERSION,
				'script'  => [
					'src'                => VVP_FACT_CHECK_URL . 'scripts/bundle.js',
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
				'version' => VVP_FACT_CHECK_VERSION,
				'style'   => [
					'src'                => VVP_FACT_CHECK_URL . 'styles/main.css',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-content-overview-frontend-vb',
				'version' => VVP_FACT_CHECK_VERSION,
				'script'  => [
					'src'                => VVP_FACT_CHECK_URL . 'scripts/content-overview-frontend.js',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'vvp-author-profile-frontend-vb',
				'version' => VVP_FACT_CHECK_VERSION,
				'script'  => [
					'src'                => VVP_FACT_CHECK_URL . 'scripts/author-profile-frontend.js',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);
	}
}
add_action( 'divi_visual_builder_assets_before_enqueue_scripts', 'vvp_fact_check_enqueue_vb_scripts' );

/**
 * Enqueue frontend styles and scripts.
 *
 * @since 1.0.0
 */
function vvp_fact_check_enqueue_frontend_scripts() {
	wp_enqueue_style(
		'vvp-fact-check-bundle-style',
		VVP_FACT_CHECK_URL . 'styles/main.css',
		array(),
		VVP_FACT_CHECK_VERSION
	);

	$fc_frontend_path = VVP_FACT_CHECK_PATH . 'scripts/fact-check-frontend.js';
	$fc_frontend_ver  = file_exists( $fc_frontend_path ) ? filemtime( $fc_frontend_path ) : VVP_FACT_CHECK_VERSION;

	wp_enqueue_script(
		'vvp-fact-check-frontend',
		VVP_FACT_CHECK_URL . 'scripts/fact-check-frontend.js',
		array(),
		$fc_frontend_ver,
		true
	);

	$co_frontend_path = VVP_FACT_CHECK_PATH . 'scripts/content-overview-frontend.js';
	$co_frontend_ver  = file_exists( $co_frontend_path ) ? filemtime( $co_frontend_path ) : VVP_FACT_CHECK_VERSION;

	wp_enqueue_script(
		'vvp-content-overview-frontend',
		VVP_FACT_CHECK_URL . 'scripts/content-overview-frontend.js',
		array(),
		$co_frontend_ver,
		true
	);

	$ap_frontend_path = VVP_FACT_CHECK_PATH . 'scripts/author-profile-frontend.js';
	$ap_frontend_ver  = file_exists( $ap_frontend_path ) ? filemtime( $ap_frontend_path ) : VVP_FACT_CHECK_VERSION;

	wp_enqueue_script(
		'vvp-author-profile-frontend',
		VVP_FACT_CHECK_URL . 'scripts/author-profile-frontend.js',
		array(),
		$ap_frontend_ver,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'vvp_fact_check_enqueue_frontend_scripts' );
