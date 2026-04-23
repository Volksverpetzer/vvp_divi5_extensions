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
    /**
     * @param array          $attrs
     * @param string         $content
     * @param WP_Block       $block
     * @param ModuleElements $elements
     * @return string
     */
    public static function render_callback($attrs, $content, $block, $elements)
    {
        $show_thumb = ($attrs['showThumbnail']['desktop']['value'] ?? 'on') !== 'off';
        $range      = $attrs['range']['desktop']['value'] ?? 'last7days';

        $items = self::get_trending_items('article', 5, $range);

        $parent       = BlockParserStore::get_parent($block->parsed_block['id'], $block->parsed_block['storeInstance']);
        $parent_attrs = $parent->attrs ?? [];

        $mount_attrs = [
            'class'               => 'vvp-ti__mount',
            'data-items'          => esc_attr(wp_json_encode($items)),
            'data-show-thumbnail' => $show_thumb ? 'true' : 'false',
        ];

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
                    'attributes'        => $mount_attrs,
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]),
            ],
        ]);
    }

    /**
     * @return list<array{title:string,url:string,thumbnailUrl:string,type:string,pageviews:int}>
     */
    private static function get_trending_items(string $content_type, int $item_count, string $range): array
    {
        $cache_key = 'vvp_trending_' . md5("{$content_type}_{$item_count}_{$range}");
        $cached    = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }

        $raw   = self::fetch_wpp_top_posts(min($item_count * 5, 100), $range);
        $items = [];

        foreach ($raw as $result) {
            if (count($items) >= $item_count) {
                break;
            }
            $post_id = (int) ($result->id ?? $result->ID ?? 0);
            if (!$post_id) {
                continue;
            }
            $post = self::build_post_data($post_id, (int) ($result->pageviews ?? 0));
            if ($post === null) {
                continue;
            }
            if (!self::path_matches_type((string) parse_url($post['url'], PHP_URL_PATH), $content_type)) {
                continue;
            }
            $items[] = $post;
        }

        set_transient($cache_key, $items, HOUR_IN_SECONDS);
        return $items;
    }

    /**
     * Fetches most-viewed posts via the WordPress Popular Posts plugin.
     * Returns an empty array silently when WPP is not active.
     *
     * @param string $range One of 'daily', 'weekly', 'monthly', 'all-time'.
     * @return list<object>
     */
    private static function fetch_wpp_top_posts(int $limit, string $range): array
    {
        if (!function_exists('wpp_get_mostpopular')) {
            return [];
        }

        $results = wpp_get_mostpopular([
            'limit'     => $limit,
            'range'     => $range,
            'post_type' => 'post,page',
        ]);

        return is_array($results) ? $results : [];
    }

    /**
     * Checks whether a URL path matches the requested content type.
     * Adjust the URL patterns here to match your permalink structure.
     */
    private static function path_matches_type(string $path, string $content_type): bool
    {
        switch ($content_type) {
            case 'podcast':
                return strpos($path, '/podcast/') !== false;
            case 'youtube':
                return strpos($path, '/youtube/') !== false || strpos($path, '/video/') !== false;
            case 'instagram':
                return strpos($path, '/instagram/') !== false;
            case 'article':
                return !preg_match('#/(podcast|youtube|video|instagram)/#', $path);
            case 'all':
            default:
                return true;
        }
    }

    /**
     * @return array{title:string,url:string,thumbnailUrl:string,type:string,pageviews:int}|null
     */
    private static function build_post_data(int $post_id, int $pageviews): ?array
    {
        $post = get_post($post_id);
        if (!$post || $post->post_status !== 'publish') {
            return null;
        }

        return [
            'title'        => get_the_title($post_id),
            'url'          => (string) get_permalink($post_id),
            'thumbnailUrl' => (string) (get_the_post_thumbnail_url($post_id, 'medium') ?: ''),
            'type'         => (string) get_post_type($post_id),
            'pageviews'    => $pageviews,
        ];
    }
}
