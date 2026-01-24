<?php
/**
 * InstagramSlideshow::module_classnames()
 *
 * @package VVP\InstagramSlideshow\InstagramSlideshow
 * @since 1.0.0
 */

namespace VVP\InstagramSlideshow\InstagramSlideshow\InstagramSlideshowTrait;

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
        return 'instagram-slideshow';
    }
}
