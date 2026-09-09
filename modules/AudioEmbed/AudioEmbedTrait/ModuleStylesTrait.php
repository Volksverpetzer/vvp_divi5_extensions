<?php
/**
 * AudioEmbed::module_styles()
 *
 * @package VVP\Divi5\AudioEmbed
 * @since 1.5.0
 */

namespace VVP\Divi5\AudioEmbed\AudioEmbedTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleStylesTrait
{
    /**
     * Module styles generation.
     *
     * @since 1.5.0
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
