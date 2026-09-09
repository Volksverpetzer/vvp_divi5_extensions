<?php
/**
 * AudioEmbed::module_script_data()
 *
 * @package VVP\Divi5\AudioEmbed
 * @since 1.5.0
 */

namespace VVP\Divi5\AudioEmbed\AudioEmbedTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleScriptDataTrait
{
    /**
     * Module script data generation.
     *
     * @since 1.5.0
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
