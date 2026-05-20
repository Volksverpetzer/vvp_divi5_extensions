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
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\TrendingItems\TrendingItems;

trait RenderCallbackTrait
{
    public static function render_callback($attrs, $content, $block, $elements)
    {
        $show_thumb = ($attrs['showThumbnail']['desktop']['value'] ?? 'on') !== 'off';
        $range      = $attrs['range']['desktop']['value'] ?? 'last7days';

        $items = self::get_trending_items(3, $range);

        if (!$show_thumb) {
            $items = array_map(function ($item) {
                $item['image_url'] = '';
                return $item;
            }, $items);
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
                HTMLUtility::render([
                    'tag'               => 'div',
                    'attributes'        => [
                        'class'          => 'vvp-ti__mount',
                        'data-articles'  => esc_attr(wp_json_encode($items)),
                    ],
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]),
            ],
        ]);
    }

    /**
     * @return list<array{type:string,title:string,link:string,date:string,image_url:string,excerpt:string,category:string,category_link:string,source:string}>
     */
    private static function get_trending_items(int $item_count, string $range): array
    {
        $cache_key = 'vvp_trending_' . md5("{$item_count}_{$range}");
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

        set_transient($cache_key, $items, HOUR_IN_SECONDS);
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
     * @return array{type:string,title:string,link:string,date:string,image_url:string,excerpt:string,category:string,category_link:string,source:string}|null
     */
    private static function build_post_data(int $post_id): ?array
    {
        $post = get_post($post_id);
        if (!$post || $post->post_status !== 'publish') {
            return null;
        }

        $categories    = get_the_category($post_id);
        $category      = $categories[0] ?? null;
        $category_name = $category ? $category->name : '';
        $category_link = $category ? (string) get_category_link($category->term_id) : '';

        $reading_time = (int) get_post_meta($post_id, '_yoast_wpseo_estimated-reading-time-minutes', true);

        return [
            'type'          => 'article',
            'title'         => get_the_title($post_id),
            'link'          => (string) get_permalink($post_id),
            'date'          => get_the_date('d.m.Y', $post_id),
            'image_url'     => (string) (get_the_post_thumbnail_url($post_id, 'medium_large') ?: ''),
            'excerpt'       => wp_strip_all_tags(get_the_excerpt($post_id)),
            'category'      => $category_name,
            'category_link' => $category_link,
            'source'        => 'volksverpetzer',
            'reading_time'  => $reading_time ?: 0,
        ];
    }
}
