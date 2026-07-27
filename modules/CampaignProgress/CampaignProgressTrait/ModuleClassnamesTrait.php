<?php
/**
 * CampaignProgress::module_classnames()
 *
 * @package VVP\Divi5\CampaignProgress
 * @since 1.0.0
 */

namespace VVP\Divi5\CampaignProgress\CampaignProgressTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleClassnamesTrait
{
    public static function module_classnames($args)
    {
        $args['classnamesInstance']->add('vvp-campaign-progress');
    }
}
