<?php
/**
 * Register all modules with dependency tree.
 *
 * @package VVP\InstagramSlideshow
 * @since 1.0.0
 */

namespace VVP\InstagramSlideshow;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use VVP\InstagramSlideshow\InstagramSlideshow\InstagramSlideshow;

add_action(
    'divi_module_library_modules_dependency_tree',
    function ($dependency_tree) {
        $dependency_tree->add_dependency(new InstagramSlideshow());
    }
);
