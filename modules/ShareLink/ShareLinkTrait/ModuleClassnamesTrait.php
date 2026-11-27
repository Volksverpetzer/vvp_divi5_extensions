<?php
/**
 * ShareLink::module_classnames()
 *
 * @package VVP\Divi5\ShareLink
 * @since 1.0.0
 */

namespace VVP\Divi5\ShareLink\ShareLinkTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleClassnamesTrait
{
    public static function module_classnames($args)
    {
        $args['classnamesInstance']->add('vvp-share-link-module');
    }
}
