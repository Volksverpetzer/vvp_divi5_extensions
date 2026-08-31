<?php
/**
 * CtaBox::module_styles()
 *
 * @package VVP\Divi5\CtaBox
 * @since 1.0.0
 */

namespace VVP\Divi5\CtaBox\CtaBoxTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\FrontEnd\Module\Style;

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
