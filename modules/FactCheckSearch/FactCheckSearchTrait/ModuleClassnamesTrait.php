<?php
/**
 * FactCheckSearch::module_classnames()
 *
 * @package VVP\Divi5\FactCheckSearch
 * @since 1.0.0
 */

namespace VVP\Divi5\FactCheckSearch\FactCheckSearchTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleClassnamesTrait
{
    /**
     * Module classnames generation.
     *
     * @since 1.0.0
     *
     * @param array $args Module classnames arguments.
     *
     * @return string CSS classnames.
     */
    public static function module_classnames($args)
    {
        $args['classnamesInstance']->add('vvp-fact-check-search');
    }
}
