<?php
/**
 * Module: ShareLink class.
 *
 * @package VVP\Divi5\ShareLink
 * @since 1.0.0
 */

namespace VVP\Divi5\ShareLink;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `ShareLink` module — a share box (title, text, native share button, copy-link button and
 * QR code) for sharing the current page or a given link.
 *
 * @since 1.0.0
 */
class ShareLink implements DependencyInterface
{
    use ShareLinkTrait\RenderCallbackTrait;
    use ShareLinkTrait\ModuleClassnamesTrait;
    use ShareLinkTrait\ModuleStylesTrait;
    use ShareLinkTrait\ModuleScriptDataTrait;

    /**
     * Loads `ShareLink` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'share-link/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/share-link/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [ShareLink::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
