<?php
/**
 * AudioEmbed::render_callback()
 *
 * @package VVP\Divi5\AudioEmbed
 * @since 1.5.0
 */

namespace VVP\Divi5\AudioEmbed\AudioEmbedTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\AudioEmbed\AudioEmbed;

trait RenderCallbackTrait
{
    const DEFAULT_BASE_URL = 'https://audio.volksverpetzer-app.de/audio/';

    /**
     * AudioEmbed render callback for server-side rendering.
     *
     * @since 1.5.0
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
        $slug = self::current_post_slug();
        if ('' === $slug) {
            return '';
        }

        // Fields declared with attrName "<name>.innerContent" in module.json
        // are stored under attrs.<name>.innerContent.<bp>.value, not
        // attrs.<name>.<bp>.value — see PR #105.
        $base_url = trim($attrs['audioBaseUrl']['innerContent']['desktop']['value'] ?? '');
        $base_url = '' !== $base_url ? $base_url : self::DEFAULT_BASE_URL;
        $base_url = rtrim($base_url, '/') . '/';

        $show_error_card = ($attrs['showErrorCard']['innerContent']['desktop']['value'] ?? 'off') !== 'off';

        $src = $base_url . rawurlencode($slug);
        if ($show_error_card) {
            $src = add_query_arg('showError', '1', $src);
        }

        $mount_attrs = [
            'class'               => 'vvp-audio-embed__mount',
            'data-slug'           => esc_attr($slug),
            // esc_url() (not esc_attr()) so a "javascript:" or other
            // disallowed-scheme value saved into this field is stripped
            // server-side too, not just by the client-side allowlist in
            // App.tsx — same reasoning as CtaBox's data-button-url.
            'data-audio-base-url'  => esc_url($base_url),
            'data-show-error-card' => $show_error_card ? 'true' : 'false',
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
            'classnamesFunction'  => [AudioEmbed::class, 'module_classnames'],
            'stylesComponent'     => [AudioEmbed::class, 'module_styles'],
            'scriptDataComponent' => [AudioEmbed::class, 'module_script_data'],
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
                // Real <noscript> fallback, parsed by the browser at initial
                // HTML load -- unlike the old Code module, which built its
                // noscript element via document.createElement() and so never
                // actually appeared for genuine no-JS visitors (that whole
                // script only ran when JS was already available).
                '<noscript><a href="' . esc_url($src) . '" target="_blank" rel="noopener noreferrer">Audio abspielen</a></noscript>',
            ],
        ]);
    }

    /**
     * The slug of the article this module is embedded in.
     *
     * Deliberately not get_the_ID(): when this module lives inside a Divi
     * Theme Builder template (the normal way to apply it site-wide to every
     * post), get_the_ID() inside the render pipeline resolves to the
     * *template's own* post object instead of the page's real singular post
     * -- see RelatedItems::current_post_id() for the same issue.
     * get_queried_object_id() tracks the main query's actual queried object
     * regardless of which Theme Builder template renders it.
     *
     * @return string Post slug, or '' if this isn't a singular post view.
     */
    private static function current_post_slug(): string
    {
        if (!is_singular()) {
            return '';
        }

        $queried_id = get_queried_object_id();
        if ($queried_id <= 0) {
            return '';
        }

        return (string) get_post_field('post_name', $queried_id);
    }
}
