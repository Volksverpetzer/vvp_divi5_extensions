<?php
/**
 * Module: TrendingList class.
 *
 * @package VVP\Divi5\TrendingList
 * @since 1.0.0
 */

namespace VVP\Divi5\TrendingList;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `TrendingList` module — displays most-read articles as a compact column list.
 *
 * @since 1.0.0
 */
class TrendingList implements DependencyInterface
{
    use TrendingListTrait\RenderCallbackTrait;
    use TrendingListTrait\ModuleClassnamesTrait;
    use TrendingListTrait\ModuleStylesTrait;
    use TrendingListTrait\ModuleScriptDataTrait;

    /**
     * Loads `TrendingList` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'trending-list/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/trending-list/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [TrendingList::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
