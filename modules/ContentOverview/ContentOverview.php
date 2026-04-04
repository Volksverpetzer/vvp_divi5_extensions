<?php
/**
 * Module: ContentOverview class.
 *
 * @package VVP\FactCheckSearch\ContentOverview
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\ContentOverview;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `ContentOverview` module for displaying the Volksverpetzer content overview / news hub.
 *
 * @since 1.0.0
 */
class ContentOverview implements DependencyInterface
{
    use ContentOverviewTrait\RenderCallbackTrait;
    use ContentOverviewTrait\ModuleClassnamesTrait;
    use ContentOverviewTrait\ModuleStylesTrait;
    use ContentOverviewTrait\ModuleScriptDataTrait;

    /**
     * Loads `ContentOverview` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_FACT_CHECK_JSON_PATH . 'content-overview/';
        $source_module_json_path = VVP_FACT_CHECK_PATH . 'src/components/content-overview/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [ContentOverview::class, 'render_callback'],
                    ]
                );
            }
        );

        // Enqueue Divi's slider script in the VB app-window iframe (preview context).
        add_action(
            'divi_visual_builder_assets_before_enqueue_app_window_scripts',
            function () {
                if (class_exists('\ET\Builder\FrontEnd\Assets\DynamicAssetsUtils')) {
                    \ET\Builder\FrontEnd\Assets\DynamicAssetsUtils::enqueue_slider_script();
                }
            }
        );
    }
}
