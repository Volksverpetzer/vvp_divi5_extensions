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
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\ContentOverview\ContentOverview;
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

    /**
     * TTL for a *failed* fetch (timeout, non-200, no same-domain matches
     * resolving to a local post). An empty result is almost always a
     * transient hiccup on a site with thousands of posts, not genuinely
     * zero related content -- caching it for the full 6h would let a
     * one-off failure look identical to "nothing to show" for hours, with
     * no admin-facing way to force a retry sooner than a full re-save.
     */
    private const EMPTY_RESULT_CACHE_TTL = 5 * \MINUTE_IN_SECONDS;

    public static function render_callback($attrs, $content, $block, $elements)
    {
        // Server-rendered cards, hydrated by content-overview-frontend.js
        // like the feed's; mirrors src/components/related-items/App.tsx.
        // Re-checked here: a cached post may since have been unpublished.
        $cards = '';
        foreach (self::get_related_ids(self::current_post_id()) as $related_id) {
            $post = get_post($related_id);
            if (ContentOverview::is_card_post($post)) {
                $cards .= '<div class="vvp-ri__item">'
                    . ContentOverview::render_article_card($post, false, 'related')
                    . '</div>';
            }
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
                '' !== $cards ? '<div class="vvp-ri__list">' . $cards . '</div>' : '',
            ],
        ]);
    }

    /**
     * Recommendations for a given post, resolved to local post IDs and
     * cached locally. Only the IDs are cached; the cards are rendered fresh,
     * so edits to a post show up right away. Empty array (never an error
     * string) on any failure, so the module just renders nothing rather
     * than a broken card.
     *
     * @return list<int>
     */
    private static function get_related_ids(int $post_id): array
    {
        if ($post_id <= 0) {
            return [];
        }

        $permalink = get_permalink($post_id);
        if (!$permalink) {
            return [];
        }

        $cache_key = self::cache_key($post_id);
        $cached    = get_transient($cache_key);
        if (is_array($cached)) {
            return $cached;
        }

        // Cache miss: only the lock holder calls out; concurrent requests for
        // the same post render nothing this time rather than piling onto
        // vectorcrawl's own rate limit (10/min) or the PHP-FPM pool.
        if (!self::acquire_refresh_lock($cache_key)) {
            return [];
        }

        $ids = self::fetch_related_ids($permalink);
        $ttl = empty($ids) ? self::EMPTY_RESULT_CACHE_TTL : self::CACHE_TTL;
        set_transient($cache_key, $ids, $ttl);
        self::release_refresh_lock($cache_key);

        return $ids;
    }

    /**
     * @return list<int>
     */
    private static function fetch_related_ids(string $permalink): array
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

        $own_host = self::normalize_host(wp_parse_url(home_url(), PHP_URL_HOST));

        $ids = [];
        foreach ($data['results'] as $result) {
            if (count($ids) >= 3) {
                break;
            }
            if (!is_array($result) || empty($result['url'])) {
                continue;
            }
            // vectorcrawl's stored Item URLs are www-prefixed while this
            // site's home_url() is the bare apex domain (verified live:
            // www.volksverpetzer.de 301s to volksverpetzer.de) -- comparing
            // hosts raw would filter out every single result. Same www/apex
            // normalization prune_wordpress.py and vvp_app's isSameHost()
            // already need for this exact domain.
            if (self::normalize_host(wp_parse_url($result['url'], PHP_URL_HOST)) !== $own_host) {
                continue; // Same filtering as the original embed script: same-domain only.
            }

            // Resolve to a local post rather than trusting the API's own
            // title/URL directly -- the card then shows the current
            // title/thumbnail/excerpt even if vectorcrawl's copy is stale
            // (see the create-only indexing webhook), and skips silently if
            // the URL no longer resolves to a published post at all.
            $post_id = url_to_postid($result['url']);
            if ($post_id > 0 && !in_array($post_id, $ids, true) && ContentOverview::is_card_post(get_post($post_id))) {
                $ids[] = $post_id;
            }
        }

        return $ids;
    }

    /**
     * The singular post actually being viewed, not the ID `get_the_ID()`
     * returns while this module renders. When this module is placed inside
     * a Divi Theme Builder template (the normal way to apply it site-wide
     * to every post), `get_the_ID()` inside the render pipeline resolves to
     * the *template's own* post object instead of the page's real singular
     * post -- so every recommendation fetch was silently keyed to the wrong
     * ID. `get_queried_object_id()` tracks the main query's actual queried
     * object regardless of which Theme Builder template renders it.
     */
    private static function current_post_id(): int
    {
        if (is_singular()) {
            $queried_id = get_queried_object_id();
            if ($queried_id > 0) {
                return $queried_id;
            }
        }
        return (int) get_the_ID();
    }

    /**
     * Lower-cases a host and strips a leading "www." so
     * "www.volksverpetzer.de" and "volksverpetzer.de" compare equal.
     * Returns '' for a null/false/empty host (e.g. a URL that failed to parse)
     * rather than matching it against a legitimate empty string.
     */
    private static function normalize_host(?string $host): string
    {
        if (empty($host)) {
            return '';
        }
        return preg_replace('/^www\./i', '', strtolower($host));
    }

    /**
     * Bump whenever a code change to what gets cached here (e.g. what
     * fetch_related_ids() returns) should invalidate every existing
     * per-post transient immediately, instead of each one silently
     * carrying stale data for up to CACHE_TTL until it naturally expires
     * or that specific post gets re-saved. Cheap: old-version entries are
     * simply orphaned under the old key and expire on their original
     * schedule, never read again.
     */
    private const CACHE_VERSION = 4;

    /**
     * Public (unlike the rest of this trait) so the main plugin file's
     * transition_post_status hook can build the same key to purge a post's
     * cached recommendation list on publish/update, without duplicating the
     * 'vvp_ri_' prefix format in two places.
     */
    public static function cache_key(int $post_id): string
    {
        return 'vvp_ri_v' . self::CACHE_VERSION . '_' . $post_id;
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
