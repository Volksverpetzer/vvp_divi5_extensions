<?php
/**
 * Register all modules with dependency tree.
 *
 * @package VVP\Divi5
 * @since 1.0.0
 */

namespace VVP\Divi5;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use VVP\Divi5\FactCheckSearch\FactCheckSearch;
use VVP\Divi5\ContentOverview\ContentOverview;
use VVP\Divi5\AuthorProfile\AuthorProfile;
use VVP\Divi5\TrendingItems\TrendingItems;
use VVP\Divi5\TrendingList\TrendingList;
use VVP\Divi5\RelatedItems\RelatedItems;
use VVP\Divi5\CampaignProgress\CampaignProgress;
use VVP\Divi5\CampaignDonate\CampaignDonate;
use VVP\Divi5\CtaBox\CtaBox;

add_action(
    'divi_module_library_modules_dependency_tree',
    function ($dependency_tree) {
        $dependency_tree->add_dependency(new FactCheckSearch());
        $dependency_tree->add_dependency(new ContentOverview());
        $dependency_tree->add_dependency(new AuthorProfile());
        $dependency_tree->add_dependency(new TrendingItems());
        $dependency_tree->add_dependency(new TrendingList());
        $dependency_tree->add_dependency(new RelatedItems());
        $dependency_tree->add_dependency(new CampaignProgress());
        $dependency_tree->add_dependency(new CampaignDonate());
        $dependency_tree->add_dependency(new CtaBox());
    }
);
