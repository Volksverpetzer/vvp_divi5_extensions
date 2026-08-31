<?php
/**
 * Module: CtaBox class.
 *
 * @package VVP\Divi5\CtaBox
 * @since 1.0.0
 */

namespace VVP\Divi5\CtaBox;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `CtaBox` module — a generic call-to-action box (icon, heading, text and an
 * optional button) for one-off prompts such as "Add us as a preferred
 * source", newsletter signups, app downloads, etc.
 *
 * @since 1.0.0
 */
class CtaBox implements DependencyInterface
{
    use CtaBoxTrait\RenderCallbackTrait;
    use CtaBoxTrait\ModuleClassnamesTrait;
    use CtaBoxTrait\ModuleStylesTrait;
    use CtaBoxTrait\ModuleScriptDataTrait;

    /**
     * Loads `CtaBox` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'cta-box/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/cta-box/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [CtaBox::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
