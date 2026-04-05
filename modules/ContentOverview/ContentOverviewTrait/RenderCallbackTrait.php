<?php
/**
 * ContentOverview::render_callback()
 *
 * @package VVP\FactCheckSearch\ContentOverview
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\ContentOverview\ContentOverviewTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\FactCheckSearch\ContentOverview\ContentOverview;

trait RenderCallbackTrait
{
    // -------------------------------------------------------------------------
    // Data fetching helpers
    // -------------------------------------------------------------------------

    /**
     * Fetch a remote URL via wp_remote_get with transient caching.
     *
     * @param string $url       Remote URL to fetch.
     * @param string $cache_key Transient key.
     * @param int    $ttl       Cache lifetime in seconds.
     *
     * @return mixed|null Decoded JSON body or null on failure.
     */
    private static function fetch_json($url, $cache_key, $ttl = 1800)
    {
        $cached = get_transient($cache_key);
        if (false !== $cached) {
            return $cached;
        }

        $response = wp_remote_get($url, [
            'timeout'    => 10,
            'user-agent' => 'VVP-ContentOverview/1.0',
        ]);

        if (is_wp_error($response)) {
            return null;
        }

        $code = wp_remote_retrieve_response_code($response);
        if (200 !== (int) $code) {
            return null;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (null === $data) {
            return null;
        }

        set_transient($cache_key, $data, $ttl);
        return $data;
    }

    /**
     * Fetch a remote URL and return the raw body string, with transient caching.
     *
     * @param string $url       Remote URL.
     * @param string $cache_key Transient key.
     * @param int    $ttl       Cache lifetime in seconds.
     *
     * @return string|null Raw body or null on failure.
     */
    private static function fetch_raw($url, $cache_key, $ttl = 3600)
    {
        $cached = get_transient($cache_key);
        if (false !== $cached) {
            return $cached;
        }

        $response = wp_remote_get($url, [
            'timeout'    => 10,
            'user-agent' => 'VVP-ContentOverview/1.0',
        ]);

        if (is_wp_error($response)) {
            return null;
        }

        $code = wp_remote_retrieve_response_code($response);
        if (200 !== (int) $code) {
            return null;
        }

        $body = wp_remote_retrieve_body($response);

        if ('' === $body) {
            return null;
        }

        set_transient($cache_key, $body, $ttl);
        return $body;
    }

    /**
     * Fetch WordPress posts from a REST API endpoint (two pages merged).
     *
     * @param string $base_url  Base REST URL including per_page and _embed params.
     * @param string $cache_key Transient key prefix.
     * @param int    $pages     Number of pages to fetch (1 or 2).
     * @param string $source    Source label ('volksverpetzer' or 'pruefpunkt').
     *
     * @return array Normalised post array.
     */
    private static function fetch_wp_posts($base_url, $cache_key, $pages = 2, $source = 'volksverpetzer')
    {
        $all_posts = [];

        for ($page = 1; $page <= $pages; $page++) {
            $key  = $cache_key . '_p' . $page;
            $url  = $base_url . '&page=' . $page;
            $data = self::fetch_json($url, $key, 1800);

            if (!is_array($data)) {
                break;
            }

            foreach ($data as &$post) {
                $post['_vvp_source'] = $source;
            }
            unset($post);

            $all_posts = array_merge($all_posts, $data);
        }

        return $all_posts;
    }

    /**
     * Extract the featured image URL from a WP REST post array.
     *
     * @param array  $post        WP post array with _embedded data.
     * @param string $size_hint   Preferred size key to look for in media_details.
     *
     * @return string Image URL or empty string.
     */
    private static function get_post_image($post, $size_hint = 'medium_large')
    {
        $media = $post['_embedded']['wp:featuredmedia'][0] ?? null;

        if (!$media) {
            return '';
        }

        // Try to get the specific size first
        $sizes = $media['media_details']['sizes'] ?? [];
        if (!empty($sizes[$size_hint]['source_url'])) {
            return $sizes[$size_hint]['source_url'];
        }

        // Fall back to full or source_url
        if (!empty($sizes['full']['source_url'])) {
            return $sizes['full']['source_url'];
        }

        return $media['source_url'] ?? '';
    }

    /**
     * Extract the category name from a WP REST post array.
     *
     * @param array $post WP post array with _embedded data.
     *
     * @return string Category name or empty string.
     */
    private static function get_post_category($post)
    {
        return $post['_embedded']['wp:term'][0][0]['name'] ?? '';
    }

    /**
     * Strip HTML and truncate a string to a given character limit.
     *
     * @param string $text  Input HTML.
     * @param int    $limit Character limit.
     *
     * @return string Truncated plain text.
     */
    private static function truncate($text, $limit = 120)
    {
        $plain = wp_strip_all_tags($text);
        $plain = html_entity_decode($plain, ENT_QUOTES, 'UTF-8');
        $plain = trim($plain);

        if (mb_strlen($plain) <= $limit) {
            return $plain;
        }

        return mb_substr($plain, 0, $limit) . '…';
    }

    /**
     * Parse an RSS 2.0 feed XML string and return structured data.
     *
     * @param string $xml_string Raw XML.
     *
     * @return array|null Associative array with 'channel_image' and 'items', or null on failure.
     */
    private static function parse_podcast_feed($xml_string)
    {
        if (empty($xml_string)) {
            return null;
        }

        // Suppress errors from malformed XML
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xml_string, 'SimpleXMLElement', LIBXML_NOCDATA);
        libxml_clear_errors();

        if (!$xml) {
            return null;
        }

        $channel = $xml->channel ?? null;
        if (!$channel) {
            return null;
        }

        // Register iTunes namespace
        $namespaces = $xml->getNamespaces(true);
        $itunes_ns  = $namespaces['itunes'] ?? 'http://www.itunes.com/dtds/podcast-1.0.dtd';

        // Get channel image
        $channel_image = '';
        $itunes_channel = $channel->children($itunes_ns);
        if (!empty($itunes_channel->image)) {
            $attrs = $itunes_channel->image->attributes();
            if (!empty($attrs['href'])) {
                $channel_image = (string) $attrs['href'];
            }
        }
        if (empty($channel_image) && !empty($channel->image->url)) {
            $channel_image = (string) $channel->image->url;
        }

        // Parse items
        $items = [];
        foreach ($channel->item as $item) {
            $itunes_item = $item->children($itunes_ns);

            $title    = (string) ($item->title ?? '');
            $pub_date = (string) ($item->pubDate ?? '');
            $link     = (string) ($item->link ?? '');
            $enclosure_url = '';
            if ($item->enclosure) {
                $enc_attrs = $item->enclosure->attributes();
                $enclosure_url = (string) ($enc_attrs['url'] ?? '');
            }
            $duration = (string) ($itunes_item->duration ?? '');
            $summary  = (string) ($itunes_item->summary ?? $item->description ?? '');

            $items[] = [
                'title'        => $title,
                'pubDate'      => $pub_date,
                'link'         => $link,
                'enclosure'    => $enclosure_url,
                'duration'     => $duration,
                'summary'      => $summary,
            ];
        }

        return [
            'channel_image' => $channel_image,
            'items'         => $items,
        ];
    }

    // -------------------------------------------------------------------------
    // Feed grouping logic (mirrors groupFeedRows from uebersicht.tsx)
    // -------------------------------------------------------------------------

    /**
     * Group flat feed items into rows of a given size.
     * Instagram items are kept in their own rows; all other items share rows.
     *
     * @param array $items    Flat array of feed item arrays, each with keys:
     *                        'kind' (article|youtube|insta), 'date' (DateTime), 'data'.
     * @param int   $row_size Items per row (typically 3).
     *
     * @return array Array of row arrays, each with 'items' and 'date' (DateTime).
     */
    private static function group_feed_rows(array $items, int $row_size = 3): array
    {
        $insta_queue = [];
        $mixed_queue = [];
        $grouped     = [];

        $flush_chunk = function (array &$queue, int $size) use (&$grouped) {
            if (count($queue) < $size) {
                return;
            }
            $chunk   = array_splice($queue, 0, $size);
            $grouped[] = ['items' => $chunk, 'date' => $chunk[0]['date']];
        };

        foreach ($items as $item) {
            if ('insta' === $item['kind']) {
                $insta_queue[] = $item;
                $flush_chunk($insta_queue, $row_size);
                continue;
            }

            $mixed_queue[] = $item;
            $flush_chunk($mixed_queue, $row_size);
        }

        // Handle leftovers — sort by newest-first date, then emit
        $leftover_groups = [];
        if (!empty($insta_queue)) {
            $leftover_groups[] = ['kind' => 'insta', 'items' => $insta_queue];
        }
        if (!empty($mixed_queue)) {
            $leftover_groups[] = ['kind' => 'mixed', 'items' => $mixed_queue];
        }

        // Sort leftover groups by date of their first item descending
        usort($leftover_groups, function ($a, $b) {
            return $b['items'][0]['date']->getTimestamp() - $a['items'][0]['date']->getTimestamp();
        });

        foreach ($leftover_groups as $group) {
            $grouped[] = ['items' => $group['items'], 'date' => $group['items'][0]['date']];
        }

        // Sort all rows by date descending
        usort($grouped, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });

        return $grouped;
    }

    // -------------------------------------------------------------------------
    // HTML rendering helpers
    // -------------------------------------------------------------------------

    /**
     * Render a source badge (Volksverpetzer or Prüfpunkt).
     *
     * @param string $source 'volksverpetzer' or 'pruefpunkt'.
     *
     * @return string HTML badge.
     */
    private static function render_source_badge($source)
    {
        if ('pruefpunkt' === $source) {
            return '<span class="vvp-co__badge vvp-co__badge--pruefpunkt">Prüfpunkt</span>';
        }
        return '<span class="vvp-co__badge vvp-co__badge--vvp">Volksverpetzer</span>';
    }

    /**
     * Render the hero article card (large, 2/3 width layout slot).
     *
     * @param array $post WP post array.
     *
     * @return string HTML.
     */
    private static function render_hero_card($post)
    {
        $image_url = esc_url(self::get_post_image($post, 'large'));
        $title     = esc_html(wp_strip_all_tags($post['title']['rendered'] ?? ''));
        $excerpt   = esc_html(self::truncate($post['excerpt']['rendered'] ?? '', 160));
        $link      = esc_url($post['link'] ?? '');
        $date      = esc_html(self::format_date($post['date'] ?? ''));
        $category  = esc_html(self::get_post_category($post));
        $source    = $post['_vvp_source'] ?? 'volksverpetzer';
        $badge     = self::render_source_badge($source);

        $image_html = '';
        if ($image_url) {
            $image_html = '<div class="vvp-co__hero-image-wrap"><img style="max-height: none;" src="' . $image_url . '" alt="' . $title . '" class="vvp-co__hero-image" loading="eager" decoding="async"></div>';
        }

        $category_html = $category ? '<span class="vvp-co__category">' . $category . '</span>' : '';

        return '<a href="' . $link . '" class="vvp-co__hero-card" target="_blank" rel="noopener noreferrer">'
            . $image_html
            . '<div class="vvp-co__hero-body">'
            .   '<div class="vvp-co__hero-meta">' . $category_html . $badge . '</div>'
            .   '<h2 class="vvp-co__hero-title">' . $title . '</h2>'
            .   ($excerpt ? '<p class="vvp-co__hero-excerpt">' . $excerpt . '</p>' : '')
            .   '<span class="vvp-co__hero-date">' . $date . '</span>'
            . '</div>'
            . '</a>';
    }

    /**
     * Render a compact article card for the sidebar.
     *
     * @param array $post WP post array.
     *
     * @return string HTML.
     */
    private static function render_compact_card($post)
    {
        $image_url = esc_url(self::get_post_image($post, 'thumbnail'));
        $title     = esc_html(wp_strip_all_tags($post['title']['rendered'] ?? ''));
        $link      = esc_url($post['link'] ?? '');
        $date      = esc_html(self::format_date($post['date'] ?? ''));
        $source    = $post['_vvp_source'] ?? 'volksverpetzer';
        $badge     = self::render_source_badge($source);

        $thumb_html = '';
        if ($image_url) {
            $thumb_html = '<img src="' . $image_url . '" alt="' . $title . '" class="vvp-co__compact-thumb" loading="lazy" decoding="async">';
        } else {
            $thumb_html = '<div class="vvp-co__compact-thumb vvp-co__compact-thumb--placeholder"></div>';
        }

        return '<a href="' . $link . '" class="vvp-co__compact-card" target="_blank" rel="noopener noreferrer">'
            . '<div class="vvp-co__compact-thumb-wrap">' . $thumb_html . '</div>'
            . '<div class="vvp-co__compact-body">'
            .   '<span class="vvp-co__compact-title">' . $title . '</span>'
            .   '<div class="vvp-co__compact-footer">' . $badge . '<span class="vvp-co__compact-date">' . $date . '</span></div>'
            . '</div>'
            . '</a>';
    }

    /**
     * Render a featured article card for the feed grid.
     *
     * @param array $post WP post array.
     *
     * @return string HTML.
     */
    private static function render_featured_card($post)
    {
        $image_url = esc_url(self::get_post_image($post, 'medium_large'));
        $title     = esc_html(wp_strip_all_tags($post['title']['rendered'] ?? ''));
        $excerpt   = esc_html(self::truncate($post['excerpt']['rendered'] ?? '', 100));
        $link      = esc_url($post['link'] ?? '');
        $date      = esc_html(self::format_date($post['date'] ?? ''));
        $category  = esc_html(self::get_post_category($post));
        $source    = $post['_vvp_source'] ?? 'volksverpetzer';
        $badge     = self::render_source_badge($source);

        $image_html = '';
        if ($image_url) {
            $image_html = '<div class="vvp-co__feed-image-wrap"><img src="' . $image_url . '" alt="' . $title . '" class="vvp-co__feed-image" loading="lazy" decoding="async"></div>';
        }

        $category_html = $category ? '<span class="vvp-co__category">' . $category . '</span>' : '';

        return '<a href="' . $link . '" class="vvp-co__feed-card vvp-co__feed-card--article" target="_blank" rel="noopener noreferrer">'
            . $image_html
            . '<div class="vvp-co__feed-body">'
            .   '<div class="vvp-co__feed-meta">' . $category_html . $badge . '</div>'
            .   '<h3 class="vvp-co__feed-title">' . $title . '</h3>'
            .   ($excerpt ? '<p class="vvp-co__feed-excerpt">' . $excerpt . '</p>' : '')
            .   '<span class="vvp-co__feed-date">' . $date . '</span>'
            . '</div>'
            . '</a>';
    }

    /**
     * Render an Instagram card for the feed grid using Divi's et_pb_slider structure.
     *
     * CAROUSEL_ALBUM posts render all child images as individual Divi slides.
     * Single IMAGE/VIDEO posts render as a one-slide slider.
     * Divi's slider JS (divi-script-library-slider) auto-initialises any
     * .et_pb_slider element it finds in the DOM on et_pb_init_modules.
     *
     * @param array $post Instagram post data from the proxy API.
     *
     * @return string HTML.
     */
    private static function render_insta_card($post)
    {
        $media_type = $post['media_type'] ?? '';
        $permalink  = esc_url($post['permalink'] ?? 'https://www.instagram.com/volksverpetzer/');
        $caption    = self::truncate($post['caption'] ?? '', 100);
        $date       = esc_html(self::format_date($post['timestamp'] ?? ''));

        // ── Collect all slides for this post ──────────────────────────────────
        $slides = [];

        if ('CAROUSEL_ALBUM' === $media_type && !empty($post['children']['data'])) {
            foreach ($post['children']['data'] as $child) {
                $thumb = $child['media_url'] ?? '';
                if ($thumb) {
                    $slides[] = ['thumb' => $thumb, 'video' => ''];
                }
            }
        }

        if (empty($slides)) {
            if ('VIDEO' === $media_type) {
                $video = $post['media_url'] ?? '';
                $thumb = $post['thumbnail_url'] ?? ''; 
                if ($video) {
                    $slides[] = ['thumb' => $thumb, 'video' => $video];
                }
            } else {
                $thumb = $post['media_url'] ?? '';
                if ($thumb) {
                    $slides[] = ['thumb' => $thumb, 'video' => ''];
                }
            }
        }

        if (empty($slides)) {
            return '';
        }

        $is_carousel = count($slides) > 1;

        $badge_label = $is_carousel
            ? 'Instagram (' . count($slides) . ' Bilder)'
            : 'Instagram';

        $props = [
            'permalink'  => $permalink,
            'caption'    => $caption,
            'date'       => $date,
            'badgeLabel' => $badge_label,
            'slides'     => $slides,
            'isCarousel' => $is_carousel
        ];

        return '<div class="vvp-co-ig-mount" data-ig-props="' . esc_attr(json_encode($props)) . '"></div>';
    }

    /**
     * Render a YouTube card for the feed grid.
     *
     * @param array $video YouTube video data.
     *
     * @return string HTML.
     */
    private static function render_youtube_card($video)
    {
        $id          = esc_attr($video['id'] ?? '');
        $title       = esc_html($video['title'] ?? '');
        $thumb_url   = esc_url($video['thumbnailUrl'] ?? '');
        $description = esc_html(self::truncate($video['description'] ?? '', 100));
        $date        = esc_html(self::format_date($video['publishedAt'] ?? ''));
        $yt_url      = $id ? esc_url('https://youtube.com/watch?v=' . $id) : '#';

        $image_html = '';
        if ($thumb_url) {
            $image_html = '<div class="vvp-co__feed-image-wrap vvp-co__feed-image-wrap--yt"><img src="' . $thumb_url . '" alt="' . esc_attr($title) . '" class="vvp-co__feed-image" loading="lazy" decoding="async"><div class="vvp-co__yt-play-btn" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div></div>';
        }

        $yt_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-2.74 12.64 12.64 0 00-8.45 2.1A12.34 12.34 0 004 16.5a4.73 4.73 0 003.44 1.32 5.55 5.55 0 004.26-2.06 5.55 5.55 0 004.26 2.06A4.73 4.73 0 0019.4 16.5a12.34 12.34 0 00-3.37-9.45 4.83 4.83 0 003.56-.36zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/></svg>';
        // Simpler YouTube badge icon
        $yt_badge = '<span class="vvp-co__badge vvp-co__badge--youtube"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 461.001 461.001" fill="currentColor" aria-hidden="true"><path d="M365.257 67.393H95.744C42.866 67.393 0 110.259 0 163.137v134.728c0 52.878 42.866 95.744 95.744 95.744h269.513c52.878 0 95.744-42.866 95.744-95.744V163.137c0-52.878-42.866-95.744-95.744-95.744zm-64.751 169.663l-126.06 60.123c-3.359 1.602-7.239-.847-7.239-4.568V168.607c0-3.774 3.982-6.22 7.348-4.514l126.06 63.943c3.748 1.899 3.683 7.274-.109 9.02z"/></svg>YouTube</span>';

        return '<a href="' . $yt_url . '" class="vvp-co__feed-card vvp-co__feed-card--youtube" target="_blank" rel="noopener noreferrer">'
            . $image_html
            . '<div class="vvp-co__feed-body">'
            .   '<div class="vvp-co__feed-meta">' . $yt_badge . '</div>'
            .   '<h3 class="vvp-co__feed-title">' . $title . '</h3>'
            .   ($description ? '<p class="vvp-co__feed-excerpt">' . $description . '</p>' : '')
            .   '<span class="vvp-co__feed-date">' . $date . '</span>'
            . '</div>'
            . '</a>';
    }

    /**
     * Render the full-width podcast banner.
     *
     * @param array  $episode       Podcast episode data.
     * @param string $channel_image Channel artwork URL.
     *
     * @return string HTML.
     */
    private static function render_podcast_banner($episode, $channel_image)
    {
        $props = [
            'title'      => $episode['title'] ?? '',
            'link'       => $episode['link'] ?? '#',
            'enclosure'  => $episode['enclosure'] ?? '',
            'date'       => self::format_date($episode['pubDate'] ?? ''),
            'duration'   => $episode['duration'] ?? '',
            'summary'    => self::truncate($episode['summary'] ?? '', 180),
            'artworkUrl' => $channel_image,
        ];

        $encoded = htmlspecialchars(json_encode($props, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ENT_QUOTES, 'UTF-8');

        return '<div class="vvp-co-podcast-mount" data-podcast-props="' . $encoded . '"></div>';
    }

    /**
     * Format an ISO 8601 or RFC 2822 date string to German format (d.m.Y).
     *
     * @param string $date_string Raw date string.
     *
     * @return string Formatted date or empty string.
     */
    private static function format_date($date_string)
    {
        if (empty($date_string)) {
            return '';
        }

        try {
            $dt = new \DateTime($date_string);
            return $dt->format('d.m.Y');
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * Parse a date string into a DateTime object. Returns null on failure.
     *
     * @param string $date_string Raw date string.
     *
     * @return \DateTime|null
     */
    private static function parse_datetime($date_string)
    {
        if (empty($date_string)) {
            return null;
        }

        try {
            return new \DateTime($date_string);
        } catch (\Exception $e) {
            return null;
        }
    }

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
        // Ensure Divi's slider + video overlay JS are enqueued when this module is on the page.
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

    /**
     * Fetch all data and assemble the complete overview HTML.
     *
     * @return string HTML markup.
     */
    private static function build_overview_html()
    {
        // --- 1. Fetch data ---

        // Volksverpetzer posts (2 pages of 12)
        $vp_posts = self::fetch_wp_posts(
            'https://volksverpetzer.de/wp-json/wp/v2/posts?per_page=12&_embed=1',
            'vvp_co_vp_posts',
            2,
            'volksverpetzer'
        );

        // Prüfpunkt posts (1 page of 10)
        $pp_posts = self::fetch_wp_posts(
            'https://pruefpunkt.org/wp-json/wp/v2/posts?per_page=10&_embed=1',
            'vvp_co_pp_posts',
            1,
            'pruefpunkt'
        );

        // Instagram
        $insta_raw  = self::fetch_json('https://volksverpetzer-app.de/proxy/instaFeed', 'vvp_co_insta', 3600);
        $insta_posts = is_array($insta_raw['data'] ?? null) ? $insta_raw['data'] : [];

        // YouTube
        $yt_raw    = self::fetch_json('https://volksverpetzer-app.de/proxy/ytAPI', 'vvp_co_yt', 3600);
        $yt_videos = is_array($yt_raw['items'] ?? null) ? $yt_raw['items'] : [];

        // Podcast RSS
        $podcast_xml   = self::fetch_raw('https://volksverpetzer.podigee.io/feed/mp3', 'vvp_co_podcast', 3600);
        $podcast_data  = self::parse_podcast_feed($podcast_xml);
        $podcast_items = $podcast_data['items'] ?? [];
        $channel_image = $podcast_data['channel_image'] ?? '';

        // --- 2. Merge and sort all articles ---
        $all_articles = array_merge($vp_posts, $pp_posts);

        usort($all_articles, function ($a, $b) {
            $ta = strtotime($a['date'] ?? 0);
            $tb = strtotime($b['date'] ?? 0);
            return $tb - $ta;
        });

        // --- 3. Skip only the newest post; everything else goes into the feed ---
        $remaining = array_slice($all_articles, 1);

        // --- 4. Build feed items ---
        $YT_INTERLEAVE_DAYS    = 14;
        $PODCAST_BANNER_DAYS   = 7;
        $TARGET_WEITERE_ITEMS  = 30;
        $FEED_ROW_SIZE         = 3;

        $now = time();

        // Article feed items
        $article_items = [];
        foreach ($remaining as $post) {
            $dt = self::parse_datetime($post['date'] ?? '');
            if (!$dt) {
                continue;
            }
            $article_items[] = ['kind' => 'article', 'date' => $dt, 'data' => $post];
        }

        // Instagram feed items
        $insta_items = [];
        foreach ($insta_posts as $post) {
            if (empty($post['timestamp'])) {
                continue;
            }
            $dt = self::parse_datetime($post['timestamp']);
            if (!$dt) {
                continue;
            }
            $insta_items[] = ['kind' => 'insta', 'date' => $dt, 'data' => $post];
        }

        // YouTube feed items (only last 14 days, max 4)
        $yt_items = [];
        foreach ($yt_videos as $video) {
            if (empty($video['publishedAt'])) {
                continue;
            }
            $dt = self::parse_datetime($video['publishedAt']);
            if (!$dt) {
                continue;
            }
            // Removing the 14-day threshold so YouTube videos are always interspersed
            $yt_items[] = ['kind' => 'youtube', 'date' => $dt, 'data' => $video];
            if (count($yt_items) >= 4) {
                break;
            }
        }

        // Merge and sort
        $merged = array_merge($article_items, $insta_items, $yt_items);
        usort($merged, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });
        $merged = array_slice($merged, 0, $TARGET_WEITERE_ITEMS);

        // Group into rows
        $grouped_rows = self::group_feed_rows($merged, $FEED_ROW_SIZE);

        // Flatten rows back to a sequential item list (preserving row grouping for rendering)
        $feed_with_podcast = [];
        foreach ($grouped_rows as $row) {
            foreach ($row['items'] as $item) {
                $feed_with_podcast[] = $item;
            }
        }

        // --- 5. Insert podcast ---
        $latest_episode      = $podcast_items[0] ?? null;
        $latest_episode_dt   = $latest_episode ? self::parse_datetime($latest_episode['pubDate'] ?? '') : null;

        if ($latest_episode && $latest_episode_dt && !is_nan($latest_episode_dt->getTimestamp())) {
            $podcast_item = [
                'kind' => 'podcast_banner',
                'date' => $latest_episode_dt,
                'data' => $latest_episode,
            ];

            $podcast_days_ago = ($now - $latest_episode_dt->getTimestamp()) / 86400;

            if ($podcast_days_ago <= $PODCAST_BANNER_DAYS) {
                // Insert at correct chronological position
                $insert_idx = -1;
                foreach ($feed_with_podcast as $idx => $item) {
                    if ($item['date']->getTimestamp() < $latest_episode_dt->getTimestamp()) {
                        $insert_idx = $idx;
                        break;
                    }
                }
                if ($insert_idx === -1) {
                    $feed_with_podcast[] = $podcast_item;
                } else {
                    array_splice($feed_with_podcast, $insert_idx, 0, [$podcast_item]);
                }
            } else {
                $feed_with_podcast[] = $podcast_item;
            }
        }

        // --- 6. Render ---
        return self::render_overview($feed_with_podcast, $channel_image);
    }

    /**
     * Assemble the overview HTML from prepared data.
     *
     * @param array  $feed_items    Flat list of feed items with kind/date/data.
     * @param string $channel_image Podcast channel artwork URL.
     *
     * @return string HTML string.
     */
    private static function render_overview($feed_items, $channel_image)
    {
        $feed_html = '';
        foreach ($feed_items as $item) {
            $kind = $item['kind'];

            if ('podcast_banner' === $kind) {
                $feed_html .= '<div class="vvp-co__feed-item vvp-co__feed-item--podcast">'
                    . self::render_podcast_banner($item['data'], $channel_image)
                    . '</div>';
                continue;
            }

            if ('article' === $kind) {
                $feed_html .= '<div class="vvp-co__feed-item">'
                    . self::render_featured_card($item['data'])
                    . '</div>';
                continue;
            }

            if ('insta' === $kind) {
                $feed_html .= '<div class="vvp-co__feed-item">'
                    . self::render_insta_card($item['data'])
                    . '</div>';
                continue;
            }

            if ('youtube' === $kind) {
                $feed_html .= '<div class="vvp-co__feed-item">'
                    . self::render_youtube_card($item['data'])
                    . '</div>';
                continue;
            }
        }

        $feed_section = '<div class="vvp-co__feed-section">'
            . '<div class="vvp-co__feed-grid">' . $feed_html . '</div>'
            . '</div>';

        return '<div class="vvp-co__wrapper">' . $feed_section . '</div>';
    }
}
