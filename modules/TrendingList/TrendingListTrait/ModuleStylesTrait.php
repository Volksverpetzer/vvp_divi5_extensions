<?php
/**
 * TrendingList::module_styles()
 *
 * @package VVP\Divi5\TrendingList
 * @since 1.0.0
 */

namespace VVP\Divi5\TrendingList\TrendingListTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\FrontEnd\Module\Style;

trait ModuleStylesTrait
{
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
