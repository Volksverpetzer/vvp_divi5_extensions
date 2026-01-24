<?php
/**
 * InstagramSlideshow::module_styles()
 *
 * @package VVP\InstagramSlideshow\InstagramSlideshow
 * @since 1.0.0
 */

namespace VVP\InstagramSlideshow\InstagramSlideshow\InstagramSlideshowTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

trait ModuleStylesTrait
{

    /**
     * Module styles generation.
     *
     * @since 1.0.0
     *
     * @param array $args Module styles arguments.
     *
     * @return string Custom inline styles.
     */
    public static function module_styles($args)
    {
        // Custom inline styles can be added here if needed.
        return '';
    }
}
