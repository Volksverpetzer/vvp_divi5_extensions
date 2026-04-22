<?php
/**
 * Module: TrendingItems class.
 *
 * @package VVP\FactCheckSearch\TrendingItems
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\TrendingItems;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `TrendingItems` module — displays most-read content sourced from Plausible Analytics.
 *
 * Requires `define('VVP_PLAUSIBLE_TOKEN', '...')` in wp-config.php.
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
        $module_json_folder_path = VVP_FACT_CHECK_JSON_PATH . 'trending-items/';
        $source_module_json_path = VVP_FACT_CHECK_PATH . 'src/components/trending-items/module.json';

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
