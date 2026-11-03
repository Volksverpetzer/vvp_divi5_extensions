<?php
/**
 * TrendingItems::render_callback()
 *
 * @package VVP\Divi5\TrendingItems
 * @since 1.0.0
 */

namespace VVP\Divi5\TrendingItems\TrendingItemsTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\ContentOverview\ContentOverview;
use VVP\Divi5\TrendingItems\TrendingItems;

trait RenderCallbackTrait
{
    /**
     * TTL for an empty result (WPP inactive/misconfigured, or the range
     * yields no posts). Caching that at the full 1h TTL like a normal
     * successful result would leave the list looking empty for up to an
     * hour after a transient hiccup, with no way to force a retry sooner
     * than a full hour -- see PR #111 (RelatedItems), which hit the same
     * failure mode.
     */
    private const EMPTY_RESULT_CACHE_TTL = 5 * \MINUTE_IN_SECONDS;

    /**
     * Lucide "arrow-up-right", shown next to the headline. Keep in sync with
     * the markup in src/components/trending-items/edit.tsx.
     */
    private const HEADLINE_ICON = '<svg class="vvp-ti__section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

    public static function render_callback($attrs, $content, $block, $elements)
    {
        // Fields declared with attrName "<name>.innerContent" in module.json
        // are stored under attrs.<name>.innerContent.<bp>.value, not
        // attrs.<name>.<bp>.value — see PR #105.
        $show_thumb = ($attrs['showThumbnail']['innerContent']['desktop']['value'] ?? 'on') !== 'off';
        $range      = $attrs['range']['innerContent']['desktop']['value'] ?? 'last7days';

        // "headline" lets editors replace "Trending"; "showHeadline" toggles
        // it. Unlike ContentOverview this defaults to off: existing
        // instances already sit under a separate Divi heading block, so an
        // unset attribute must not suddenly add a second heading.
        $headline_text = trim($attrs['headline']['innerContent']['desktop']['value'] ?? '');
        $show_headline = ($attrs['showHeadline']['innerContent']['desktop']['value'] ?? 'off') === 'on';
        if ('' === $headline_text) {
            $headline_text = 'Trending';
        }

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
            'classnamesFunction'  => [TrendingItems::class, 'module_classnames'],
            'stylesComponent'     => [TrendingItems::class, 'module_styles'],
            'scriptDataComponent' => [TrendingItems::class, 'module_script_data'],
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
                // Built by hand (not HTMLUtility) because the heading holds
                // an inline SVG, which HTMLUtility's esc_html would escape.
                $show_headline
                    ? '<h2 class="vvp-ti__section-title">'
                        . esc_html($headline_text)
                        . self::HEADLINE_ICON
                        . '</h2>'
                    : '',
                self::render_list($range, $show_thumb),
            ],
        ]);
    }

    /**
     * The card list, or the empty-state message. Server-rendered cards,
     * hydrated by content-overview-frontend.js like the feed's; mirrors
     * src/components/trending-items/App.tsx.
     */
    private static function render_list(string $range, bool $show_thumb): string
    {
        $cards = '';
        foreach (self::get_trending_ids(3, $range) as $post_id) {
            // Re-checked: a cached post may since have been unpublished.
            $post = get_post($post_id);
            if (ContentOverview::is_card_post($post)) {
                $cards .= '<div class="vvp-ti__item">'
                    . ContentOverview::render_article_card($post, false, 'trending', $show_thumb)
                    . '</div>';
            }
        }

        return '' !== $cards
            ? '<div class="vvp-ti__list">' . $cards . '</div>'
            : '<div class="vvp-ti__empty">Keine Trending-Beiträge gefunden.</div>';
    }

    /**
     * IDs of the most-read articles in the range, cached. Only the IDs are
     * cached; the cards are rendered fresh, so edits to a post show up
     * right away.
     *
     * @return list<int>
     */
    private static function get_trending_ids(int $item_count, string $range): array
    {
        // Versioned: bump when what's cached here changes, so entries in the
        // old format aren't served until they expire.
        $cache_key = 'vvp_trending_v3_' . md5("{$item_count}_{$range}");
        $cached    = get_transient($cache_key);
        if (is_array($cached)) {
            return $cached;
        }

        $ids = [];
        foreach (self::fetch_wpp_ids(min($item_count * 5, 100), $range) as $post_id) {
            if (count($ids) >= $item_count) {
                break;
            }
            if (ContentOverview::is_card_post(get_post($post_id))) {
                $ids[] = $post_id;
            }
        }

        $ttl = empty($ids) ? self::EMPTY_RESULT_CACHE_TTL : HOUR_IN_SECONDS;
        set_transient($cache_key, $ids, $ttl);

        return $ids;
    }

    /**
     * Fetches top post IDs via wpp_get_ids. Returns [] silently when WPP is not active.
     *
     * @return list<int>
     */
    private static function fetch_wpp_ids(int $limit, string $range): array
    {
        if (!function_exists('wpp_get_ids')) {
            return [];
        }

        $ids = wpp_get_ids([
            'limit'     => $limit,
            'range'     => $range,
            'post_type' => 'post',
        ]);

        return is_array($ids) ? array_map('intval', $ids) : [];
    }
}
