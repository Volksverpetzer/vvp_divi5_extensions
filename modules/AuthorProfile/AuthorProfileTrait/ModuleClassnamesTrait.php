<?php
/**
 * AuthorProfile::module_classnames()
 *
 * @package VVP\FactCheckSearch\AuthorProfile
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\AuthorProfile\AuthorProfileTrait;

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
        $args['classnamesInstance']->add('vvp-author-profile');
    }
}
