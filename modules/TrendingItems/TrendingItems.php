<?php
/**
 * Module: TrendingItems class.
 *
 * @package VVP\Divi5\TrendingItems
 * @since 1.0.0
 */

namespace VVP\Divi5\TrendingItems;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `TrendingItems` module — displays most-read content via WordPress Popular Posts.
 *
 * @since 1.0.0
 */
class TrendingItems implements DependencyInterface
{
    use TrendingItemsTrait\RenderCallbackTrait;
    use TrendingItemsTrait\ModuleClassnamesTrait;
    use TrendingItemsTrait\ModuleStylesTrait;
    use TrendingItemsTrait\ModuleScriptDataTrait;

    /**
     * @since 1.0.0
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'trending-items/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/trending-items/module.json';

        if (!file_exists($module_json_folder_path . 'module.json') && file_exists($source_module_json_path)) {
            $module_json_folder_path = dirname($source_module_json_path) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [TrendingItems::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
