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

        $html = self::build_overview_html();

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
     * @return string HTML markup.
     */
    private static function build_overview_html()
    {
        // 1. Fetch -----------------------------------------------------------

        $vp_posts = self::fetch_wp_posts(
            'https://volksverpetzer.de/wp-json/wp/v2/posts?per_page=12&_embed=1',
            'vvp_co_vp_posts',
            2,
            'volksverpetzer'
        );

        $pp_posts = self::fetch_wp_posts(
            'https://pruefpunkt.org/wp-json/wp/v2/posts?per_page=10&_embed=1',
            'vvp_co_pp_posts',
            1,
            'pruefpunkt'
        );

        $insta_raw   = self::fetch_json('https://volksverpetzer-app.de/proxy/instaFeed', 'vvp_co_insta', 3600);
        $insta_posts = is_array($insta_raw['data'] ?? null) ? $insta_raw['data'] : [];

        $yt_raw    = self::fetch_json('https://volksverpetzer-app.de/proxy/ytAPI', 'vvp_co_yt', 3600);
        $yt_videos = is_array($yt_raw['items'] ?? null) ? $yt_raw['items'] : [];

        $podcast_xml   = self::fetch_raw('https://volksverpetzer.podigee.io/feed/mp3', 'vvp_co_podcast', 3600);
        $podcast_data  = self::parse_podcast_feed($podcast_xml);
        $podcast_items = $podcast_data['items'] ?? [];
        $channel_image = $podcast_data['channel_image'] ?? '';

        // 2. Sort articles, skip hero ----------------------------------------

        $all_articles = array_merge($vp_posts, $pp_posts);
        $seen_ids     = [];
        $all_articles = array_values(array_filter($all_articles, function ($post) use (&$seen_ids) {
            $id = $post['id'] ?? null;
            if ($id === null || isset($seen_ids[$id])) {
                return false;
            }
            $seen_ids[$id] = true;
            return true;
        }));
        usort($all_articles, function ($a, $b) {
            return strtotime($b['date'] ?? 0) - strtotime($a['date'] ?? 0);
        });
        $remaining = array_slice($all_articles, 1); // hero post excluded

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
                if (++$insta_added >= 12) {
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
            if (self::is_youtube_short($video['id'] ?? '')) {
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

            if (++$yt_added >= 20) {
                break;
            }
        }

        $podcast_feed = [];
        $episode      = $podcast_items[0] ?? null;
        $episode_dt   = $episode ? self::parse_datetime($episode['pubDate'] ?? '') : null;
        if ($episode && $episode_dt) {
            $podcast_feed[] = ['kind' => 'podcast_banner', 'date' => $episode_dt, 'data' => $episode];
        }

        // 4. Merge, sort, cap ------------------------------------------------
        // Articles + YouTube share a combined cap of 12 (newest first).
        // Instagram gets its own 12. Podcast banner is always included.

        $other_items = array_merge($article_items, $yt_items);
        usort($other_items, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });
        $other_items = array_slice($other_items, 0, 12);

        $merged = array_merge($insta_items, $other_items, $podcast_feed);
        usort($merged, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });

        // 5. Render ----------------------------------------------------------

        return self::render_overview($merged, $channel_image);
    }

    // -------------------------------------------------------------------------
    // Feed rendering
    // -------------------------------------------------------------------------

    /**
     * Render the grouped feed grid from a flat sorted item list.
     *
     * @param array  $feed_items    Flat list of typed feed items.
     * @param string $channel_image Podcast channel artwork URL.
     *
     * @return string HTML.
     */
    private static function render_overview($feed_items, $channel_image)
    {
        $rows      = self::group_feed_rows($feed_items, 3);
        $feed_html = '';

        foreach ($rows as $row) {
            foreach ($row['items'] as $item) {
                $kind = esc_attr($item['kind']);
                switch ($item['kind']) {
                    case 'podcast_banner':
                        $feed_html .= '<div class="vvp-co__feed-item vvp-co__feed-item--podcast" data-co-kind="' . $kind . '">'
                            . self::render_podcast_banner($item['data'], $channel_image)
                            . '</div>';
                        break;
                    case 'article':
                        $feed_html .= '<div class="vvp-co__feed-item" data-co-kind="' . $kind . '">'
                            . self::render_featured_card($item['data'])
                            . '</div>';
                        break;
                    case 'insta':
                        $feed_html .= '<div class="vvp-co__feed-item" data-co-kind="' . $kind . '">'
                            . self::render_insta_card($item['data'])
                            . '</div>';
                        break;
                    case 'youtube':
                        $feed_html .= '<div class="vvp-co__feed-item" data-co-kind="' . $kind . '">'
                            . self::render_youtube_card($item['data'])
                            . '</div>';
                        break;
                }
            }
        }

        $section_header = '<div class="vvp-co__section-header">'
            . '<h2 class="vvp-co__section-title">Das Neuste</h2>'
            . '<label class="vvp-co__filter-toggle" for="vvp-co-filter-articles">'
            .   '<span class="vvp-co__filter-toggle-label">Nur Artikel</span>'
            .   '<span class="vvp-co__toggle-track">'
            .     '<input type="checkbox" class="vvp-co__toggle-input" id="vvp-co-filter-articles">'
            .     '<span class="vvp-co__toggle-thumb"></span>'
            .   '</span>'
            . '</label>'
            . '</div>';

        return '<div class="vvp-co__wrapper">'
            . '<div class="vvp-co__feed-section">'
            .   $section_header
            .   '<div class="vvp-co__feed-grid">' . $feed_html . '</div>'
            . '</div>'
            . '</div>';
    }
}
