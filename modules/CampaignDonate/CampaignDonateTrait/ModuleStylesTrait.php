<?php
/**
 * CampaignDonate::module_styles()
 *
 * @package VVP\Divi5\CampaignDonate
 * @since 1.0.0
 */

namespace VVP\Divi5\CampaignDonate\CampaignDonateTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\FrontEnd\Module\Style;

trait ModuleStylesTrait
{
    /**
     * Module styles generation.
     *
     * Registers the module's decoration styles via Style::add() so the JS
     * side's styles.tsx (StyleContainer/elements.style()) has a matching
     * server-side counterpart — without this, the Visual Builder editor
     * fell back to an auto-generated "preset--group--...--divi-background
     * --default" class instead of applying module-classnames.ts's wrapper
     * class, leaving the module's own CSS (style.scss) unable to match.
     *
     * @since 1.0.0
     *
     * @param array $args Module styles arguments.
     *
     * @return string Custom inline styles.
     */
    public static function module_styles($args)
    {
        $elements = $args['elements'];
        $settings = $args['settings'] ?? [];

        Style::add([
            'id'            => $args['id'],
            'name'          => $args['name'],
            'orderIndex'    => $args['orderIndex'],
            'storeInstance' => $args['storeInstance'],
            'styles'        => [
                $elements->style([
                    'attrName'   => 'module',
                    'styleProps' => [
                        'disabledOn' => [
                            'disabledModuleVisibility' => $settings['disabledModuleVisibility'] ?? null,
                        ],
                    ],
                ]),
            ],
        ]);

        return '';
    }
}
