<?php
/**
 * Module: CampaignDonate class.
 *
 * @package VVP\Divi5\CampaignDonate
 * @since 1.0.0
 */

namespace VVP\Divi5\CampaignDonate;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `CampaignDonate` module — embeds a donation form (amount picker + Stripe
 * Embedded Checkout) directly on the page, backed by a campaign app's
 * /api/create-checkout-session and /api/finalize-session endpoints. No
 * redirect away from the page for card/SEPA/etc. payment methods.
 *
 * @since 1.0.0
 */
class CampaignDonate implements DependencyInterface
{
    use CampaignDonateTrait\RenderCallbackTrait;
    use CampaignDonateTrait\ModuleClassnamesTrait;
    use CampaignDonateTrait\ModuleStylesTrait;
    use CampaignDonateTrait\ModuleScriptDataTrait;

    /**
     * Loads `CampaignDonate` and registers Front-End render callback.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function load()
    {
        $module_json_folder_path = VVP_DIVI5_JSON_PATH . 'campaign-donate/';
        $source_module_json_path = VVP_DIVI5_PATH . 'src/components/campaign-donate/module.json';

        if ( ! file_exists( $module_json_folder_path . 'module.json' ) && file_exists( $source_module_json_path ) ) {
            $module_json_folder_path = dirname( $source_module_json_path ) . '/';
        }

        add_action(
            'init',
            function () use ($module_json_folder_path) {
                ModuleRegistration::register_module(
                    $module_json_folder_path,
                    [
                        'render_callback' => [CampaignDonate::class, 'render_callback'],
                    ]
                );
            }
        );
    }
}
