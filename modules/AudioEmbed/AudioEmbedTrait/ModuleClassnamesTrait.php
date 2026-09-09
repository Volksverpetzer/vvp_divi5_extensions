<?php
/**
 * AudioEmbed::module_classnames()
 *
 * @package VVP\Divi5\AudioEmbed
 * @since 1.5.0
 */

namespace VVP\Divi5\AudioEmbed\AudioEmbedTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleClassnamesTrait
{
    /**
     * Module classnames generation.
     *
     * @since 1.5.0
     *
     * @param array $args Module classnames arguments.
     *
     * @return string CSS classnames.
     */
    public static function module_classnames($args)
    {
        $args['classnamesInstance']->add('vvp-audio-embed');
    }
}
