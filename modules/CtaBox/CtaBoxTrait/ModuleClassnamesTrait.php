<?php
/**
 * CtaBox::module_classnames()
 *
 * @package VVP\Divi5\CtaBox
 * @since 1.0.0
 */

namespace VVP\Divi5\CtaBox\CtaBoxTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleClassnamesTrait
{
    public static function module_classnames($args)
    {
        $args['classnamesInstance']->add('vvp-cta-box-module');
    }
}
