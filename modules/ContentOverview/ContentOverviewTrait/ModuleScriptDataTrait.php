<?php
/**
 * ContentOverview::module_script_data()
 *
 * @package VVP\FactCheckSearch\ContentOverview
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\ContentOverview\ContentOverviewTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleScriptDataTrait
{
    /**
     * Module script data generation.
     *
     * @since 1.0.0
     *
     * @param array $args Module script data arguments.
     *
     * @return array Script data attributes.
     */
    public static function module_script_data($args)
    {
        return [];
    }
}
