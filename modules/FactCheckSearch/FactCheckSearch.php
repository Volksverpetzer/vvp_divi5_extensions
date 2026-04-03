<?php
/**
 * Module: FactCheckSearch class.
 *
 * @package VVP\FactCheckSearch\FactCheckSearch
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\FactCheckSearch;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `FactCheckSearch` module for displaying the Volksverpetzer Faktencheck search bar.
 *
 * @since 1.0.0
 */
class FactCheckSearch implements DependencyInterface
{
    use FactCheckSearchTrait\RenderCallbackTrait;
    use FactCheckSearchTrait\ModuleClassnamesTrait;
    use FactCheckSearchTrait\ModuleStylesTrait;
    use FactCheckSearchTrait\ModuleScriptDataTrait;

    /**
     * Loads `FactCheckSearch` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_FACT_CHECK_JSON_PATH . 'fact-check-search/';
        $source_module_json_path = VVP_FACT_CHECK_PATH . 'src/components/fact-check-search/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [FactCheckSearch::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
