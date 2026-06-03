<?php
/**
 * AuthorProfile::module_script_data()
 *
 * @package VVP\Divi5\AuthorProfile
 * @since 1.0.0
 */

namespace VVP\Divi5\AuthorProfile\AuthorProfileTrait;

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
