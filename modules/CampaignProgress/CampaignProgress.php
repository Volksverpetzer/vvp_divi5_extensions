<?php
/**
 * Module: CampaignProgress class.
 *
 * @package VVP\Divi5\CampaignProgress
 * @since 1.0.0
 */

namespace VVP\Divi5\CampaignProgress;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `CampaignProgress` module — displays a donation progress bar backed by a
 * campaign's public summary API (e.g. the crowdfunding app's
 * /api/campaign-summary endpoint).
 *
 * @since 1.0.0
 */
class CampaignProgress implements DependencyInterface
{
    use CampaignProgressTrait\RenderCallbackTrait;
    use CampaignProgressTrait\ModuleClassnamesTrait;
    use CampaignProgressTrait\ModuleStylesTrait;
    use CampaignProgressTrait\ModuleScriptDataTrait;

    /**
     * Loads `CampaignProgress` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'campaign-progress/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/campaign-progress/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [CampaignProgress::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
