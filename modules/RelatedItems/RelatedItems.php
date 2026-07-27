<?php
/**
 * Module: RelatedItems class.
 *
 * @package VVP\Divi5\RelatedItems
 * @since 1.0.0
 */

namespace VVP\Divi5\RelatedItems;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `RelatedItems` module — displays vectorcrawl's semantic recommendations
 * ("Passend dazu") for the current post.
 *
 * @since 1.0.0
 */
class RelatedItems implements DependencyInterface
{
    use RelatedItemsTrait\RenderCallbackTrait;
    use RelatedItemsTrait\ModuleClassnamesTrait;
    use RelatedItemsTrait\ModuleStylesTrait;
    use RelatedItemsTrait\ModuleScriptDataTrait;

    /**
     * Loads `RelatedItems` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'related-items/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/related-items/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [RelatedItems::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
