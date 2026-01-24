<?php
/**
 * InstagramSlideshow::module_script_data()
 *
 * @package VVP\InstagramSlideshow\InstagramSlideshow
 * @since 1.0.0
 */

namespace VVP\InstagramSlideshow\InstagramSlideshow\InstagramSlideshowTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleScriptDataTrait
{

    /**
     * Module script data generation for passing settings to frontend JavaScript.
     *
     * @since 1.0.0
     *
     * @param array $args Module script data arguments.
     *
     * @return array Script data attributes.
     */
    public static function module_script_data($args)
    {
        $attrs = $args['attrs'] ?? [];

        return [
            'autoplay' => $attrs['autoplay']['desktop']['value'] ?? 'off',
            'transitionSpeed' => $attrs['transitionSpeed']['desktop']['value'] ?? '3',
        ];
    }
}
