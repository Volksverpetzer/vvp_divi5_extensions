<?php
/**
 * FactCheckSearch::module_styles()
 *
 * @package VVP\FactCheckSearch\FactCheckSearch
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\FactCheckSearch\FactCheckSearchTrait;

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
