<?php
/**
 * Module: AudioEmbed class.
 *
 * @package VVP\Divi5\AudioEmbed
 * @since 1.5.0
 */

namespace VVP\Divi5\AudioEmbed;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `AudioEmbed` module for embedding the vvp_wp_audio_converter player
 * (or its "not yet available" state) for the current article.
 *
 * Replaces the hand-written `<iframe height="100">` Code module previously
 * used in the article Theme Builder template, which had no way to collapse
 * itself when an article has no audio yet.
 *
 * @since 1.5.0
 */
class AudioEmbed implements DependencyInterface
{
    use AudioEmbedTrait\RenderCallbackTrait;
    use AudioEmbedTrait\ModuleClassnamesTrait;
    use AudioEmbedTrait\ModuleStylesTrait;
    use AudioEmbedTrait\ModuleScriptDataTrait;

    /**
     * Loads `AudioEmbed` and registers Front-End render callback.
     *
     * @since 1.5.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'audio-embed/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/audio-embed/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [AudioEmbed::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
