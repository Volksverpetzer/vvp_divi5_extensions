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
        // episodes) can't bloat the page — a few "Load more" clicks' worth
        // is rendered up front, not the entire history.
        $items_to_show = (int) ($attrs['itemsToShow']['innerContent']['desktop']['value'] ?? 0);
        if ($items_to_show <= 0) {
            $items_to_show = 24;
        }
        $items_to_show = max(1, min($items_to_show, 60));
        $render_cap    = min($items_to_show * 5, 90);

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
        // carry a station's entire back catalogue.
        $podcast_feed = [];
        foreach ($podcast_items as $episode) {
            $dt = self::parse_datetime($episode['pubDate'] ?? '');
            if ($dt) {
                $podcast_feed[] = ['kind' => 'podcast_banner', 'date' => $dt, 'data' => $episode];
                if (count($podcast_feed) >= $render_cap) {
                    break;
                }
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

        // 4. Merge, sort, cap ------------------------------------------------
        // Articles + remaining YouTube share a combined cap of $render_cap
        // (newest first). Instagram and podcast episodes get their own
        // $render_cap each. The YouTube banner is always included, so it's
        // reserved a slot and capped separately from the rest of the pool —
        // otherwise enough newer items in the other sources could push it
        // past the final $render_cap slice and silently drop it.

        $other_items = array_merge($article_items, $yt_items);
        usort($other_items, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });
        $other_items = array_slice($other_items, 0, $render_cap);

        $cappable = array_merge($insta_items, $other_items, $podcast_feed);
        usort($cappable, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });
        $cappable = array_slice($cappable, 0, max(0, $render_cap - count($yt_banner_feed)));

        $merged = array_merge($cappable, $yt_banner_feed);
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
        $rows      = self::group_feed_rows($feed_items, 3);
        $feed_html = '';
        $index     = 0;

        foreach ($rows as $row) {
            foreach ($row['items'] as $item) {
                $kind        = esc_attr($item['kind']);
                $item_attrs  = ' data-co-index="' . $index . '"' . ($index >= $items_to_show ? ' hidden' : '');
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
            . (int) $items_to_show . '"' . ($index > $items_to_show ? '' : ' hidden') . '>Mehr laden</button>';

        return '<div class="vvp-co__wrapper">'
            . '<div class="vvp-co__feed-section">'
            .   $section_header
            .   '<div class="vvp-co__feed-grid">' . $feed_html . '</div>'
            .   $load_more_html
            . '</div>'
            . '</div>';
    }
}
