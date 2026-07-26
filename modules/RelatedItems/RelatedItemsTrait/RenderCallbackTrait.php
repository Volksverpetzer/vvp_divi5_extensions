<?php
/**
 * RelatedItems::render_callback()
 *
 * @package VVP\Divi5\RelatedItems
 * @since 1.0.0
 */

namespace VVP\Divi5\RelatedItems\RelatedItemsTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\RelatedItems\RelatedItems;

trait RenderCallbackTrait
{
    /**
     * vectorcrawl's recommend endpoint. Same host FactCheckSearch already
     * calls for search/import (ai.volksverpetzer-app.de/api/...).
     */
    private const RECOMMEND_API_URL = 'https://ai.volksverpetzer-app.de/api/recommend/';

    /**
     * How long a post's resolved recommendation list is cached locally.
     * Matches vectorcrawl's own edge Cache-Control for /api/recommend/
     * (6h), so we're never staler than the upstream anyway.
     */
    private const CACHE_TTL = 6 * \HOUR_IN_SECONDS;

    public static function render_callback($attrs, $content, $block, $elements)
    {
        $items = self::get_related_items(get_the_ID());

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
            'classnamesFunction'  => [RelatedItems::class, 'module_classnames'],
            'stylesComponent'     => [RelatedItems::class, 'module_styles'],
            'scriptDataComponent' => [RelatedItems::class, 'module_script_data'],
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
                        'class'         => 'vvp-ri__mount',
                        'data-articles' => esc_attr(wp_json_encode($items)),
                    ],
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]),
            ],
        ]);
    }

    /**
     * Recommendations for a given post, resolved to local post data and
     * cached locally. Empty array (never an error string) on any failure,
     * so the module just renders nothing rather than a broken card.
     *
     * @return list<array{type:string,title:string,link:string,date:string,image_url:string,excerpt:string,category:string,category_link:string,source:string,reading_time:int}>
     */
    private static function get_related_items(int $post_id): array
    {
        if ($post_id <= 0) {
            return [];
        }

        $permalink = get_permalink($post_id);
        if (!$permalink) {
            return [];
        }

        $cache_key = 'vvp_ri_' . $post_id;
        $cached    = get_transient($cache_key);
        if (false !== $cached) {
            return $cached;
        }

        // Cache miss: only the lock holder calls out; concurrent requests for
        // the same post render nothing this time rather than piling onto
        // vectorcrawl's own rate limit (10/min) or the PHP-FPM pool.
        if (!self::acquire_refresh_lock($cache_key)) {
            return [];
        }

        $items = self::fetch_related_items($permalink);
        set_transient($cache_key, $items, self::CACHE_TTL);
        self::release_refresh_lock($cache_key);

        return $items;
    }

    /**
     * @return list<array{type:string,title:string,link:string,date:string,image_url:string,excerpt:string,category:string,category_link:string,source:string,reading_time:int}>
     */
    private static function fetch_related_items(string $permalink): array
    {
        $request_url = self::RECOMMEND_API_URL . '?' . http_build_query(['url' => $permalink]);

        $response = wp_remote_get($request_url, [
            'timeout'    => 5,
            'user-agent' => 'VVP-RelatedItems/1.0',
        ]);

        if (is_wp_error($response) || 200 !== (int) wp_remote_retrieve_response_code($response)) {
            return [];
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!is_array($data) || !is_array($data['results'] ?? null)) {
            return [];
        }

        $own_host = wp_parse_url(home_url(), PHP_URL_HOST);

        $items = [];
        foreach ($data['results'] as $result) {
            if (count($items) >= 3) {
                break;
            }
            if (!is_array($result) || empty($result['url'])) {
                continue;
            }
            if (wp_parse_url($result['url'], PHP_URL_HOST) !== $own_host) {
                continue; // Same filtering as the original embed script: same-domain only.
            }

            // Resolve to a local post rather than trusting the API's own
            // title/URL directly -- gives us the current title/thumbnail/
            // excerpt even if vectorcrawl's copy is stale (see the
            // create-only indexing webhook), and skips silently if the URL
            // no longer resolves to a published post at all.
            $post_id = url_to_postid($result['url']);
            $post    = self::build_post_data($post_id);
            if ($post !== null) {
                $items[] = $post;
            }
        }

        return $items;
    }

    /**
     * @return array{type:string,title:string,link:string,date:string,image_url:string,excerpt:string,category:string,category_link:string,source:string,reading_time:int}|null
     */
    private static function build_post_data(int $post_id): ?array
    {
        if ($post_id <= 0) {
            return null;
        }

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
            'title'         => html_entity_decode((string) get_the_title($post_id), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
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

    private static function acquire_refresh_lock(string $cache_key): bool
    {
        $lock_key = $cache_key . '_lock';

        if (wp_using_ext_object_cache()) {
            return wp_cache_add($lock_key, 1, 'vvp_ri_lock', 15);
        }

        if (false !== get_transient($lock_key)) {
            return false;
        }
        return set_transient($lock_key, 1, 15);
    }

    private static function release_refresh_lock(string $cache_key): void
    {
        $lock_key = $cache_key . '_lock';

        if (wp_using_ext_object_cache()) {
            wp_cache_delete($lock_key, 'vvp_ri_lock');
            return;
        }

        delete_transient($lock_key);
    }
}
