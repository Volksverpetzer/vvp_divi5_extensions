<?php
/**
 * ContentOverview::module_styles()
 *
 * @package VVP\FactCheckSearch\ContentOverview
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\ContentOverview\ContentOverviewTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleStylesTrait
{
    /**
     * Module styles generation.
     *
     * @since 1.0.0
     *
     * @param array $args Module styles arguments.
     *
     * @return string Custom inline styles.
     */
    public static function module_styles($args)
    {
        return '';
    }
}
