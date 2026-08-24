<?php
/**
 * TrendingList::render_callback()
 *
 * @package VVP\Divi5\TrendingList
 * @since 1.0.0
 */

namespace VVP\Divi5\TrendingList\TrendingListTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\TrendingList\TrendingList;

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

    public static function render_callback($attrs, $content, $block, $elements)
    {
        // "range" is declared with attrName "range.innerContent" in
        // module.json, so it's stored under attrs.range.innerContent.<bp>.value,
        // not attrs.range.<bp>.value — see PR #105.
        $range = $attrs['range']['innerContent']['desktop']['value'] ?? 'last7days';
        $items = self::get_trending_items(3, $range);

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
            'classnamesFunction'  => [TrendingList::class, 'module_classnames'],
            'stylesComponent'     => [TrendingList::class, 'module_styles'],
            'scriptDataComponent' => [TrendingList::class, 'module_script_data'],
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
                    'attributes'        => [
                        'class'         => 'vvp-tl__mount',
                        'data-articles' => esc_attr(wp_json_encode($items)),
                    ],
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]),
            ],
        ]);
    }

    /**
     * @return list<array{title:string,link:string,date:string,authors:list<string>}>
     */
    private static function get_trending_items(int $item_count, string $range): array
    {
        // Bump this prefix whenever the cached item shape OR the author
        // lookup logic changes -- v3 fixes get_authors_for_post() calling a
        // PublishPress function name that didn't exist, so v2-cached items
        // hold co-authored posts' data with only the single fallback author
        // baked in and must not be served after this fix (up to 1h TTL).
        $cache_key = 'vvp_tl_v3_' . md5("{$item_count}_{$range}");
        $cached    = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }

        $ids   = self::fetch_wpp_ids(min($item_count * 5, 100), $range);
        $items = [];

        foreach ($ids as $post_id) {
            if (count($items) >= $item_count) {
                break;
            }
            $post = self::build_post_data((int) $post_id);
            if ($post !== null) {
                $items[] = $post;
            }
        }

        $ttl = empty($items) ? self::EMPTY_RESULT_CACHE_TTL : HOUR_IN_SECONDS;
        set_transient($cache_key, $items, $ttl);
        return $items;
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

    /**
     * @return array{title:string,link:string,date:string,authors:list<string>}|null
     */
    private static function build_post_data(int $post_id): ?array
    {
        $post = get_post($post_id);
        if (!$post || $post->post_status !== 'publish') {
            return null;
        }

        return [
            'title'   => html_entity_decode((string) get_the_title($post_id), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'link'    => (string) get_permalink($post_id),
            'date'    => get_the_date('j. F Y', $post_id),
            'authors' => self::get_authors_for_post($post),
        ];
    }

    /**
     * Reads all co-authors for a post from PublishPress Authors (if active),
     * falling back to the single WordPress core post author. AuthorProfile
     * applies the same PublishPress-or-core-fallback idea, though it reads
     * the current archive/single context via get_archive_author() rather
     * than doing a per-post lookup -- see
     * AuthorProfileTrait/RenderCallbackTrait.php::get_authors_for_context().
     *
     * Uses get_post_authors() -- the current, non-deprecated template tag
     * (get_multiple_authors() and publishpress_authors_get_post_authors()
     * are both marked @deprecated in favor of it) -- and NOT
     * multiple_authors_get_authors(), which doesn't exist in this plugin at
     * all (function_exists() silently evaluated to false, so every post
     * always fell through to the single-author fallback below).
     *
     * @return list<string>
     */
    private static function get_authors_for_post(\WP_Post $post): array
    {
        if (function_exists('get_post_authors')) {
            $authors = get_post_authors($post->ID);
            $authors = is_array($authors) ? $authors : [];
            $names   = array_values(array_filter(array_map(
                static fn ($author) => (string) ($author->display_name ?? ''),
                $authors
            )));

            if (!empty($names)) {
                return $names;
            }
        }

        return [get_the_author_meta('display_name', $post->post_author)];
    }
}
