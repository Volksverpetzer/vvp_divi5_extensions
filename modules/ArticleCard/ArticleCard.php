<?php
/**
 * Module: ArticleCard class.
 *
 * @package VVP\Divi5\ArticleCard
 * @since 1.6.0
 */

namespace VVP\Divi5\ArticleCard;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `ArticleCard` module: renders the current post as the ContentOverview feed
 * card. Meant to be placed inside a Divi 5 Loop (e.g. query type "Current
 * Page" on archive templates), where Divi repeats it once per post.
 *
 * @since 1.6.0
 */
class ArticleCard implements DependencyInterface
{
    use ArticleCardTrait\RenderCallbackTrait;
    use ArticleCardTrait\ModuleClassnamesTrait;
    use ArticleCardTrait\ModuleStylesTrait;
    use ArticleCardTrait\ModuleScriptDataTrait;

    /**
     * Loads `ArticleCard` and registers Front-End render callback.
     *
     * @since 1.6.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'article-card/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/article-card/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [ArticleCard::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
