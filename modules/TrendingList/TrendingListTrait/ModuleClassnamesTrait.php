<?php
/**
 * TrendingList::module_classnames()
 *
 * @package VVP\Divi5\TrendingList
 * @since 1.0.0
 */

namespace VVP\Divi5\TrendingList\TrendingListTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleClassnamesTrait
{
    public static function module_classnames($args)
    {
        $args['classnamesInstance']->add('vvp-trending-list');
    }
}
