<?php
/**
 * ShareLink::render_callback()
 *
 * @package VVP\Divi5\ShareLink
 * @since 1.0.0
 */

namespace VVP\Divi5\ShareLink\ShareLinkTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\ShareLink\ShareLink;

trait RenderCallbackTrait
{
    const DEFAULT_TITLE    = 'Teile die Aktion!';
    const DEFAULT_QR_LABEL = 'Scan mit dem Handy';

    /**
     * Resolves the link to share. Empty means the current page; a root-relative
     * path becomes an absolute URL on this site; anything that is not http(s)
     * falls back to the current page's permalink.
     *
     * @since 1.0.0
     *
     * @param string $raw Link as entered in the module settings.
     *
     * @return string Absolute http(s) URL (or empty if there is no current post).
     */
    /**
     * Permalink of the page being viewed, or '' off singular pages (the
     * client then falls back to its own location). Uses the queried object
     * rather than the global $post, which is the template's post when the
     * module renders from a Divi Theme Builder template.
     *
     * @return string
     */
    private static function current_page_url()
    {
        if (!is_singular()) {
            return '';
        }

        $id = get_queried_object_id();

        return $id ? (string) get_permalink($id) : '';
    }

    public static function resolve_share_url($raw)
    {
        $raw = trim((string) $raw);

        if ('' === $raw) {
            return self::current_page_url();
        }

        if (0 === strpos($raw, '/') && 0 !== strpos($raw, '//')) {
            $raw = home_url($raw);
        }

        if (!preg_match('#^https?://#i', $raw)) {
            return self::current_page_url();
        }

        return $raw;
    }

    /**
     * ShareLink render callback for server-side rendering.
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
        // are stored under attrs.<name>.innerContent.<bp>.value.
        $title    = trim($attrs['title']['innerContent']['desktop']['value'] ?? '');
        $text     = trim($attrs['text']['innerContent']['desktop']['value'] ?? '');
        $url      = $attrs['url']['innerContent']['desktop']['value'] ?? '';
        $qr_label = trim($attrs['qrLabel']['innerContent']['desktop']['value'] ?? '');

        // Defaults apply when empty so an old save without the field still shows them.
        $title    = '' !== $title ? $title : self::DEFAULT_TITLE;
        $qr_label = '' !== $qr_label ? $qr_label : self::DEFAULT_QR_LABEL;

        $mount_attrs = [
            'class'         => 'vvp-share-link__mount',
            'data-title'    => esc_attr($title),
            'data-text'     => esc_attr($text),
            // esc_url() strips disallowed schemes; the client re-validates too.
            'data-url'      => esc_url(self::resolve_share_url($url)),
            'data-qr-label' => esc_attr($qr_label),
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
            'classnamesFunction'  => [ShareLink::class, 'module_classnames'],
            'stylesComponent'     => [ShareLink::class, 'module_styles'],
            'scriptDataComponent' => [ShareLink::class, 'module_script_data'],
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
