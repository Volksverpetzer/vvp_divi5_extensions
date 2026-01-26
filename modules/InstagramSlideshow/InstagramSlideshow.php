<?php
/**
 * Module: Instagram Slideshow class.
 *
 * @package VVP\InstagramSlideshow\InstagramSlideshow
 * @since 1.0.0
 */

namespace VVP\InstagramSlideshow\InstagramSlideshow;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `InstagramSlideshow` module for displaying Instagram carousel posts as interactive slideshows.
 *
 * This is a dependency class and can be used as a dependency for `DependencyTree`.
 *
 * @since 1.0.0
 */
class InstagramSlideshow implements DependencyInterface
{
    use InstagramSlideshowTrait\RenderCallbackTrait;
    use InstagramSlideshowTrait\ModuleClassnamesTrait;
    use InstagramSlideshowTrait\ModuleStylesTrait;
    use InstagramSlideshowTrait\ModuleScriptDataTrait;

    /**
     * Loads `InstagramSlideshow` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = INSTAGRAM_SLIDESHOW_JSON_PATH . 'instagram-slideshow/';
        $source_module_json_path = INSTAGRAM_SLIDESHOW_PATH . 'src/components/instagram-slideshow/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [InstagramSlideshow::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
