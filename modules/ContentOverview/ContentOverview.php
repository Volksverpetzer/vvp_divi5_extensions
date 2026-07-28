<?php
/**
 * Module: ContentOverview class.
 *
 * @package VVP\Divi5\ContentOverview
 * @since 1.0.0
 */

namespace VVP\Divi5\ContentOverview;

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
     * Transient holding the locally queried Volksverpetzer article list.
     *
     * Written by DataFetchTrait::query_local_volksverpetzer_articles() and
     * purged by the transition_post_status hook in vvp-divi5-extensions.php —
     * reference this constant from both sides so they cannot drift apart.
     */
    public const LOCAL_POSTS_TRANSIENT = 'vvp_co_vp_local';

    /**
     * YouTube classifies videos at or under this length as Shorts.
     *
     * Used to filter the YouTube feed down to regular (3-min+) videos only.
     */
    public const YT_SHORT_MAX_SECONDS = 180;

    /**
     * Loads `ContentOverview` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'content-overview/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/content-overview/module.json';

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

        // Enqueue Divi's slider + video overlay scripts in the VB app-window iframe (preview context).
        add_action(
            'divi_visual_builder_assets_before_enqueue_app_window_scripts',
            function () {
                if (class_exists('\ET\Builder\FrontEnd\Assets\DynamicAssetsUtils')) {
                    \ET\Builder\FrontEnd\Assets\DynamicAssetsUtils::enqueue_slider_script();
                    \ET\Builder\FrontEnd\Assets\DynamicAssetsUtils::enqueue_video_overlay_script();
                }
            }
        );
    }
}
