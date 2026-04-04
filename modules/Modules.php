<?php
/**
 * Register all modules with dependency tree.
 *
 * @package VVP\FactCheckSearch
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use VVP\FactCheckSearch\FactCheckSearch\FactCheckSearch;
use VVP\FactCheckSearch\ContentOverview\ContentOverview;

add_action(
    'divi_module_library_modules_dependency_tree',
    function ($dependency_tree) {
        $dependency_tree->add_dependency(new FactCheckSearch());
        $dependency_tree->add_dependency(new ContentOverview());
    }
);
