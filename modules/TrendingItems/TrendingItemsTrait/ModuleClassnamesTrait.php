<?php
/**
 * TrendingItems::module_classnames()
 *
 * @package VVP\Divi5\TrendingItems
 * @since 1.0.0
 */

namespace VVP\Divi5\TrendingItems\TrendingItemsTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleClassnamesTrait
{
    public static function module_classnames($args)
    {
        $args['classnamesInstance']->add('vvp-trending-items');
    }
}
