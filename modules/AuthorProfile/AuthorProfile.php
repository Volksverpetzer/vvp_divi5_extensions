<?php
/**
 * Module: AuthorProfile class.
 *
 * @package VVP\Divi5\AuthorProfile
 * @since 1.0.0
 */

namespace VVP\Divi5\AuthorProfile;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `AuthorProfile` module for displaying the post author(s) with avatar and bio.
 * Reads author data from PublishPress Authors if available, falls back to WP core.
 *
 * @since 1.0.0
 */
class AuthorProfile implements DependencyInterface
{
    use AuthorProfileTrait\RenderCallbackTrait;
    use AuthorProfileTrait\ModuleClassnamesTrait;
    use AuthorProfileTrait\ModuleStylesTrait;
    use AuthorProfileTrait\ModuleScriptDataTrait;

    /**
     * Loads `AuthorProfile` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'author-profile/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/author-profile/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [AuthorProfile::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
