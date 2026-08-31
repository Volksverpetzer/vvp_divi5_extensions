<?php
/**
 * CtaBox::render_callback()
 *
 * @package VVP\Divi5\CtaBox
 * @since 1.0.0
 */

namespace VVP\Divi5\CtaBox\CtaBoxTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\CtaBox\CtaBox;

trait RenderCallbackTrait
{
    const ICONS   = ['none', 'star', 'bookmark', 'bell', 'newspaper', 'heart', 'check'];
    const VARIANTS = ['accent', 'outline', 'subtle'];

    /**
     * CtaBox render callback for server-side rendering.
     *
     * @since 1.0.0
     *
     * @param array          $attrs    Block attributes saved by Visual Builder.
     * @param string         $content  Block content.
     * @param WP_Block       $block    Parsed block object being rendered.
     * @param ModuleElements $elements ModuleElements instance.
     *
     * @return string HTML rendered output.
     */
    public static function render_callback($attrs, $content, $block, $elements)
    {
        // Fields declared with attrName "<name>.innerContent" in module.json
        // are stored under attrs.<name>.innerContent.<bp>.value, not
        // attrs.<name>.<bp>.value — see PR #105.
        $icon           = $attrs['icon']['innerContent']['desktop']['value'] ?? 'star';
        $icon           = in_array($icon, self::ICONS, true) ? $icon : 'star';
        $heading        = trim($attrs['heading']['innerContent']['desktop']['value'] ?? '');
        $text           = trim($attrs['text']['innerContent']['desktop']['value'] ?? '');
        $button_label   = trim($attrs['buttonLabel']['innerContent']['desktop']['value'] ?? '');
        $button_url     = trim($attrs['buttonUrl']['innerContent']['desktop']['value'] ?? '');
        $button_new_tab = ($attrs['buttonNewTab']['innerContent']['desktop']['value'] ?? 'on') !== 'off';
        $variant        = $attrs['variant']['innerContent']['desktop']['value'] ?? 'accent';
        $variant        = in_array($variant, self::VARIANTS, true) ? $variant : 'accent';

        $mount_attrs = [
            'class'              => 'vvp-cta-box__mount',
            'data-icon'          => esc_attr($icon),
            'data-heading'       => esc_attr($heading),
            'data-text'          => esc_attr($text),
            'data-button-label'  => esc_attr($button_label),
            'data-button-url'    => esc_attr($button_url),
            'data-button-new-tab' => $button_new_tab ? 'true' : 'false',
            'data-variant'       => esc_attr($variant),
        ];

        $parent       = BlockParserStore::get_parent($block->parsed_block['id'], $block->parsed_block['storeInstance']);
        $parent_attrs = $parent->attrs ?? [];

        return Module::render([
            'orderIndex'          => $block->parsed_block['orderIndex'],
            'storeInstance'       => $block->parsed_block['storeInstance'],
            'attrs'               => $attrs,
            'elements'            => $elements,
            'id'                  => $block->parsed_block['id'],
            'name'                => $block->block_type->name,
            'moduleCategory'      => $block->block_type->category,
            'classnamesFunction'  => [CtaBox::class, 'module_classnames'],
            'stylesComponent'     => [CtaBox::class, 'module_styles'],
            'scriptDataComponent' => [CtaBox::class, 'module_script_data'],
            'parentAttrs'         => $parent_attrs,
            'parentId'            => $parent->id ?? '',
            'parentName'          => $parent->blockName ?? '',
            'children'            => [
                ElementComponents::component([
                    'attrs'         => $attrs['module']['decoration'] ?? [],
                    'id'            => $block->parsed_block['id'],
                    'orderIndex'    => $block->parsed_block['orderIndex'],
                    'storeInstance' => $block->parsed_block['storeInstance'],
                ]),
                HTMLUtility::render([
                    'tag'               => 'div',
                    'attributes'        => $mount_attrs,
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]),
            ],
        ]);
    }
}
