<?php
/**
 * ContentOverview::render_callback() — orchestrates data fetching, grouping, and rendering.
 *
 * @package VVP\Divi5\ContentOverview
 * @since 1.0.0
 */

namespace VVP\Divi5\ContentOverview\ContentOverviewTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\ContentOverview\ContentOverview;

require_once __DIR__ . '/DataFetchTrait.php';
require_once __DIR__ . '/FeedGroupTrait.php';
require_once __DIR__ . '/CardRenderTrait.php';

trait RenderCallbackTrait
{
    use DataFetchTrait;
    use FeedGroupTrait;
    use CardRenderTrait;

    // -------------------------------------------------------------------------
    // Main render callback
    // -------------------------------------------------------------------------

    /**
     * ContentOverview render callback for server-side rendering.
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
        if (class_exists('\ET\Builder\FrontEnd\Assets\DynamicAssetsUtils')) {
            \ET\Builder\FrontEnd\Assets\DynamicAssetsUtils::enqueue_slider_script();
            \ET\Builder\FrontEnd\Assets\DynamicAssetsUtils::enqueue_video_overlay_script();
        }

        $parent       = BlockParserStore::get_parent($block->parsed_block['id'], $block->parsed_block['storeInstance']);
        $parent_attrs = $parent->attrs ?? [];

        $html = self::build_overview_html($attrs);

        return Module::render([
            'orderIndex'          => $block->parsed_block['orderIndex'],
            'storeInstance'       => $block->parsed_block['storeInstance'],
            'attrs'               => $attrs,
            'elements'            => $elements,
            'id'                  => $block->parsed_block['id'],
            'name'                => $block->block_type->name,
            'moduleCategory'      => $block->block_type->category,
            'classnamesFunction'  => [ContentOverview::class, 'module_classnames'],
            'stylesComponent'     => [ContentOverview::class, 'module_styles'],
            'scriptDataComponent' => [ContentOverview::class, 'module_script_data'],
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
                $html,
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // Data assembly
    // -------------------------------------------------------------------------

    /**
     * Fetch all data sources and assemble the complete overview HTML.
     *
     * @param array $attrs Block attributes saved by Visual Builder.
     *
     * @return string HTML markup.
     */
    private static function build_overview_html($attrs = [])
    {
        // "contentTypes" is declared with attrName "contentTypes.innerContent" in
        // module.json, so it's stored under attrs.contentTypes.innerContent.<bp>.value.
        // An empty/missing selection means "show everything" (backward compatible
        // with modules saved before this setting existed).
        $selected_types = $attrs['contentTypes']['innerContent']['desktop']['value'] ?? [];
        if (!is_array($selected_types) || empty($selected_types)) {
            $selected_types = ['articles-volksverpetzer', 'articles-pruefpunkt', 'instagram', 'youtube', 'podcast'];
        }
        $show_vvp_articles = in_array('articles-volksverpetzer', $selected_types, true);
        $show_pp_articles  = in_array('articles-pruefpunkt', $selected_types, true);
        $show_instagram    = in_array('instagram', $selected_types, true);
        $show_youtube      = in_array('youtube', $selected_types, true);
        $show_podcast      = in_array('podcast', $selected_types, true);

        // The filter toggle only makes sense when the feed actually mixes
        // article and non-article content — hide it when the editor narrowed
        // the selection down to only article sources, only non-article
        // sources, or a single content type (e.g. a podcast-only page).
        $has_articles     = $show_vvp_articles || $show_pp_articles;
        $has_non_articles = $show_instagram || $show_youtube || $show_podcast;
        $show_filter_toggle = $has_articles && $has_non_articles;

        // "itemsToShow" is the number of items visible on first load and the
        // batch size "Load more" reveals at a time. $render_cap bounds how
        // many items are fetched/pre-rendered in total (hidden until
        // revealed) so a large upstream feed (e.g. dozens of podcast
        // episodes) can't bloat the page. Kept tight (2x, capped at 60) since
        // every pre-rendered-but-hidden item still costs a full HTML+JSON
        // payload on every page view — one "Load more" batch's worth of
        // headroom is enough; a visitor who wants more can click again.
        $items_to_show = (int) ($attrs['itemsToShow']['innerContent']['desktop']['value'] ?? 0);
        if ($items_to_show <= 0) {
            $items_to_show = 24;
        }
        $items_to_show = max(1, min($items_to_show, 60));
        $render_cap    = min($items_to_show * 2, 60);

        // 1. Fetch -----------------------------------------------------------

        $vp_posts = $show_vvp_articles ? self::fetch_volksverpetzer_articles() : [];
        $pp_posts = $show_pp_articles ? self::fetch_pruefpunkt_articles() : [];

        $insta_posts    = $show_instagram ? self::fetch_insta_feed('volksverpetzer') : [];
        $insta_pp_posts = $show_instagram ? self::fetch_insta_feed('pruefpunkt') : [];

        // Merge both accounts' Instagram posts. Dedupe by post ID: the proxy may
        // serve the same posts for both accounts (e.g. while the Prüfpunkt token
        // is misconfigured), which would otherwise duplicate every card.
        $insta_posts = array_merge($insta_posts, $insta_pp_posts);
        $seen_ig_ids = [];
        $insta_posts = array_values(array_filter($insta_posts, function ($post) use (&$seen_ig_ids) {
            $id = $post['id'] ?? null;
            if ($id === null || isset($seen_ig_ids[$id])) {
                return false;
            }
            $seen_ig_ids[$id] = true;
            return true;
        }));
        usort($insta_posts, function ($a, $b) {
            return (int) strtotime($b['timestamp'] ?? '') - (int) strtotime($a['timestamp'] ?? '');
        });

        $yt_videos = $show_youtube ? self::fetch_yt_feed() : [];

        $podcast_xml   = $show_podcast ? self::fetch_podcast_xml() : '';
        $podcast_data  = $show_podcast ? self::parse_podcast_feed($podcast_xml) : [];
        $podcast_items = $podcast_data['items'] ?? [];
        $channel_image = $podcast_data['channel_image'] ?? '';

        // 2. Sort articles, skip hero ----------------------------------------

        $all_articles = array_merge($vp_posts, $pp_posts);
        $seen_ids     = [];
        $all_articles = array_values(array_filter($all_articles, function ($post) use (&$seen_ids) {
            $id = $post['id'] ?? null;
            if ($id === null) {
                return false;
            }
            // Key includes the source: post IDs are only unique per site, so a
            // Prüfpunkt post must never be dropped for sharing an ID with a VVP post.
            $key = ($post['_vvp_source'] ?? 'volksverpetzer') . ':' . $id;
            if (isset($seen_ids[$key])) {
                return false;
            }
            $seen_ids[$key] = true;
            return true;
        }));
        usort($all_articles, function ($a, $b) {
            return (int) strtotime($b['date'] ?? '') - (int) strtotime($a['date'] ?? '');
        });
        $remaining = self::exclude_hero_post($all_articles);

        // 3. Build typed feed items ------------------------------------------

        $article_items = [];
        foreach ($remaining as $post) {
            $dt = self::parse_datetime($post['date'] ?? '');
            if ($dt) {
                $article_items[] = ['kind' => 'article', 'date' => $dt, 'data' => $post];
            }
        }

        $insta_items  = [];
        $insta_added  = 0;
        foreach ($insta_posts as $post) {
            $dt = self::parse_datetime($post['timestamp'] ?? '');
            if ($dt) {
                $insta_items[] = ['kind' => 'insta', 'date' => $dt, 'data' => $post];
                if (++$insta_added >= $render_cap) {
                    break;
                }
            }
        }

        $yt_items = [];
        $yt_added = 0;
        foreach ($yt_videos as $video) {
            $snippet  = $video['snippet'] ?? [];
            $pub_date = $snippet['publishedAt'] ?? '';
            $dt       = self::parse_datetime($pub_date);
            if (!$dt) {
                continue;
            }
            if (self::is_youtube_short_video($video)) {
                continue;
            }

            $thumbs    = $snippet['thumbnails'] ?? [];
            $thumb_url = $thumbs['maxres']['url']
                ?? $thumbs['standard']['url']
                ?? $thumbs['high']['url']
                ?? $thumbs['medium']['url']
                ?? $thumbs['default']['url']
                ?? '';

            $yt_items[] = ['kind' => 'youtube', 'date' => $dt, 'data' => [
                'id'           => $video['id'] ?? '',
                'title'        => $snippet['title'] ?? '',
                'description'  => $snippet['description'] ?? '',
                'publishedAt'  => $pub_date,
                'thumbnailUrl' => $thumb_url,
            ]];

            if (++$yt_added >= $render_cap) {
                break;
            }
        }

        // Every podcast episode becomes its own full-width banner card (not
        // just the latest one) — capped by $render_cap since the RSS feed can
        // carry a station's entire back catalogue. An episode with a missing
        // or unparseable pubDate still gets shown (falling back to the same
        // epoch placeholder the single-episode code used before), sorted to
        // the end, rather than silently disappearing.
        $podcast_feed = [];
        foreach ($podcast_items as $episode) {
            $dt             = self::parse_datetime($episode['pubDate'] ?? '') ?? new \DateTime('1970-01-01');
            $podcast_feed[] = ['kind' => 'podcast_banner', 'date' => $dt, 'data' => $episode];
            if (count($podcast_feed) >= $render_cap) {
                break;
            }
        }

        // Extract the latest YouTube video as an always-shown banner.
        $yt_banner_feed = [];
        if (!empty($yt_items)) {
            usort($yt_items, function ($a, $b) {
                return $b['date']->getTimestamp() - $a['date']->getTimestamp();
            });
            $latest_yt        = array_shift($yt_items); // remove from regular pool
            $yt_banner_feed[] = ['kind' => 'youtube_banner', 'date' => $latest_yt['date'], 'data' => $latest_yt['data']];
        }

        // Extract the latest podcast episode as an always-shown banner too —
        // same treatment as the YouTube banner, and deliberately NOT a
        // bigger reservation: podcast episodes publish far less often than
        // articles, so reserving many of them (by rank) meant on a mixed
        // page they were almost always older than a full day's worth of
        // articles/Instagram — landing entirely in the hidden/"Load
        // more"-only bucket while eating the budget those faster-moving
        // sources needed to stay visible themselves (clicking "Load more"
        // then revealed only podcast episodes, since nothing else was left
        // in the buffer). One pinned episode is enough to guarantee a
        // podcast-only page never shows zero episodes; every other episode
        // now competes in the normal capped pool like everything else.
        $podcast_banner_feed = [];
        if (!empty($podcast_feed)) {
            // $podcast_feed preserves the RSS feed's own (newest-first)
            // order, same assumption the pre-existing single-episode code
            // already relied on ($podcast_items[0]).
            $podcast_banner_feed[] = array_shift($podcast_feed);
        }

        // Pinned items are always included AND always visible on first
        // load, regardless of their date rank — see render_overview().
        foreach ($yt_banner_feed as &$item) {
            $item['_pinned'] = true;
        }
        unset($item);
        foreach ($podcast_banner_feed as &$item) {
            $item['_pinned'] = true;
        }
        unset($item);

        // 4. Merge, sort, cap ------------------------------------------------
        // The pinned YouTube and podcast banners (at most one of each) are
        // always included, never dropped by the cap. Articles, remaining
        // YouTube, Instagram, and every other podcast episode share the
        // rest of $render_cap (newest first).

        $other_items = array_merge($article_items, $yt_items);
        usort($other_items, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });
        $other_items = array_slice($other_items, 0, $render_cap);

        $always_include = array_merge($podcast_banner_feed, $yt_banner_feed);

        $cappable = array_merge($insta_items, $other_items, $podcast_feed);
        usort($cappable, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });
        $cappable = array_slice($cappable, 0, max(0, $render_cap - count($always_include)));

        $merged = array_merge($cappable, $always_include);
        usort($merged, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });

        // 5. Render ----------------------------------------------------------

        return self::render_overview($merged, $channel_image, $items_to_show, $show_filter_toggle);
    }

    /**
     * Remove the post shown in the frontpage hero from the article list.
     *
     * The hero module queries the local database live and always shows the
     * newest published post, while this feed mixes sources that can lag
     * behind it: the local article list sits in a short transient, and the
     * Prüfpunkt/REST-fallback data comes over HTTP with far longer caching.
     * Dropping "our newest" (the old array_slice($all_articles, 1)) therefore
     * removed the wrong article whenever the list was stale or a Prüfpunkt
     * post happened to be newest. Matching the hero by its actual post ID
     * cannot misfire: if the hero post is not in the (stale) list yet,
     * nothing is dropped — the hero post is not in the feed anyway, so no
     * duplicate can appear.
     *
     * @param array $articles Merged, deduped, date-sorted article list.
     *
     * @return array Articles without the hero post.
     */
    private static function exclude_hero_post(array $articles): array
    {
        if (!function_exists('get_posts')) {
            // Outside a full WP runtime (dev-preview.php): keep the old
            // skip-newest behaviour.
            return array_slice($articles, 1);
        }

        $hero_ids = get_posts([
            'numberposts'  => 1,
            'post_status'  => 'publish',
            'fields'       => 'ids',
            'no_found_rows' => true,
        ]);
        $hero_id = $hero_ids ? (int) $hero_ids[0] : 0;

        if (0 === $hero_id) {
            // Cannot determine the hero post (empty site or query failure):
            // fall back to the old behaviour of skipping the newest article.
            return array_slice($articles, 1);
        }

        return array_values(array_filter($articles, function ($post) use ($hero_id) {
            // Post IDs are only unique per site — never match a Prüfpunkt
            // post against a Volksverpetzer hero ID.
            return 'volksverpetzer' !== ($post['_vvp_source'] ?? 'volksverpetzer')
                || (int) ($post['id'] ?? 0) !== $hero_id;
        }));
    }

    // -------------------------------------------------------------------------
    // Feed rendering
    // -------------------------------------------------------------------------

    /**
     * Render the grouped feed grid from a flat sorted item list.
     *
     * @param array  $feed_items         Flat list of typed feed items.
     * @param string $channel_image      Podcast channel artwork URL.
     * @param int    $items_to_show      Items visible on first load; also the
     *                                   "Load more" batch size.
     * @param bool   $show_filter_toggle Whether to render the "Nur Artikel" toggle.
     *
     * @return string HTML.
     */
    private static function render_overview($feed_items, $channel_image, $items_to_show, $show_filter_toggle)
    {
        // Decide visibility from each item's rank in $feed_items — the
        // original, flat, date-sorted order — before group_feed_rows()
        // re-groups items into display rows below. Row-grouping can locally
        // reorder items (e.g. batching Instagram posts into groups of 3, or
        // delaying a partial row), so computing "hidden" from the
        // post-grouping iteration order would make "items shown" diverge
        // from "the N most recent items". Pinned items (the YouTube and
        // podcast banners) are additionally always visible regardless of
        // rank — see the "_pinned" tagging in build_overview_html().
        foreach ($feed_items as $rank => &$item) {
            $item['_visible'] = !empty($item['_pinned']) || $rank < $items_to_show;
        }
        unset($item);

        $rows         = self::group_feed_rows($feed_items, 3);
        $feed_html    = '';
        $index        = 0;
        $hidden_count = 0;

        foreach ($rows as $row) {
            foreach ($row['items'] as $item) {
                $kind       = esc_attr($item['kind']);
                $is_hidden  = empty($item['_visible']);
                $item_attrs = ' data-co-index="' . $index . '"' . ($is_hidden ? ' hidden' : '');
                switch ($item['kind']) {
                    case 'podcast_banner':
                        $feed_html .= '<div class="vvp-co__feed-item vvp-co__feed-item--podcast" data-co-kind="' . $kind . '"' . $item_attrs . '>'
                            . self::render_podcast_banner($item['data'], $channel_image)
                            . '</div>';
                        break;
                    case 'youtube_banner':
                    case 'youtube':
                        $feed_html .= '<div class="vvp-co__feed-item vvp-co__feed-item--youtube-banner" data-co-kind="youtube"' . $item_attrs . '>'
                            . self::render_youtube_banner($item['data'])
                            . '</div>';
                        break;
                    case 'article':
                        $feed_html .= '<div class="vvp-co__feed-item" data-co-kind="' . $kind . '"' . $item_attrs . '>'
                            . self::render_featured_card($item['data'])
                            . '</div>';
                        break;
                    case 'insta':
                        $feed_html .= '<div class="vvp-co__feed-item" data-co-kind="' . $kind . '"' . $item_attrs . '>'
                            . self::render_insta_card($item['data'])
                            . '</div>';
                        break;
                    default:
                        // Unknown kind: don't advance the visible-item index for it.
                        continue 2;
                }
                $index++;
                if ($is_hidden) {
                    $hidden_count++;
                }
            }
        }

        $filter_toggle_html = '';
        if ($show_filter_toggle) {
            $filter_toggle_html = '<label class="vvp-co__filter-toggle" for="vvp-co-filter-articles">'
                .   '<span class="vvp-co__filter-toggle-label">Nur Artikel</span>'
                .   '<span class="vvp-co__toggle-track">'
                .     '<input type="checkbox" class="vvp-co__toggle-input" id="vvp-co-filter-articles">'
                .     '<span class="vvp-co__toggle-thumb"></span>'
                .   '</span>'
                . '</label>';
        }

        $section_header = '<div class="vvp-co__section-header">'
            . '<h2 class="vvp-co__section-title">Das Neueste</h2>'
            . $filter_toggle_html
            . '</div>';

        $load_more_html = '<button type="button" class="vvp-co__load-more-btn" data-co-load-more data-co-batch-size="'
            . (int) $items_to_show . '"' . ($hidden_count > 0 ? '' : ' hidden') . '>Mehr laden</button>';

        return '<div class="vvp-co__wrapper">'
            . '<div class="vvp-co__feed-section">'
            .   $section_header
            .   '<div class="vvp-co__feed-grid">' . $feed_html . '</div>'
            .   $load_more_html
            . '</div>'
            . '</div>';
    }
}
