<?php
/**
 * HTTP fetching, WP post helpers, podcast parser, and date utilities.
 *
 * @package VVP\Divi5\ContentOverview
 * @since 1.0.0
 */

namespace VVP\Divi5\ContentOverview\ContentOverviewTrait;

trait DataFetchTrait
{
    /**
     * Fetch a remote URL via wp_remote_get with transient caching.
     *
     * @param string $url       Remote URL to fetch.
     * @param string $cache_key Transient key.
     * @param int    $ttl       Cache lifetime in seconds.
     *
     * @return mixed|null Decoded JSON body or null on failure.
     */
    private static function fetch_json($url, $cache_key, $ttl = 1800, bool $force = false)
    {
        if (!$force) {
            $cached = get_transient($cache_key);
            if (false !== $cached) {
                return $cached;
            }
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
    private static function fetch_raw($url, $cache_key, $ttl = 3600, bool $force = false)
    {
        if (!$force) {
            $cached = get_transient($cache_key);
            if (false !== $cached) {
                return $cached;
            }
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
     * Probe the YouTube /shorts/ endpoint to determine whether a video is a Short.
     *
     * A 200 response means the video lives at the /shorts/ URL → it is a Short.
     * A redirect (3xx) means YouTube sends the browser to the regular watch page → regular video.
     *
     * Result is cached for 7 days per video ID (a video's type never changes).
     *
     * @param string $video_id YouTube video ID.
     *
     * @return bool True if the video is a Short (should be filtered out).
     */
    private static function is_youtube_short(string $video_id): bool
    {
        if (empty($video_id)) {
            return false;
        }

        $cache_key = 'vvp_co_yt_short_' . $video_id;
        $cached    = get_transient($cache_key);
        if (false !== $cached) {
            return (bool) $cached;
        }

        $url      = 'https://www.youtube.com/shorts/' . rawurlencode($video_id);
        $response = wp_remote_head($url, [
            'timeout'     => 5,
            'redirection' => 0,
            'user-agent'  => 'Mozilla/5.0',
            'headers'     => [
                // Bypass the EU/GDPR consent redirect (consent.youtube.com) that
                // YouTube sends to all server-side requests from EU IP addresses.
                // Without this cookie every request gets a 302 → consent.youtube.com
                // instead of 200 (Short) or 302 → /watch (regular video).
                'Cookie' => 'SOCS=CAI',
            ],
        ]);

        if (is_wp_error($response)) {
            // On network error assume not a Short so we don't silently drop videos.
            return false;
        }

        $code     = (int) wp_remote_retrieve_response_code($response);
        $is_short = (200 === $code);

        set_transient($cache_key, $is_short ? 1 : 0, 604800); // 7 days
        return $is_short;
    }

    /**
     * Fetch WordPress posts from a REST API endpoint (one or more pages merged).
     *
     * @param string $base_url  Base REST URL including per_page and _embed params.
     * @param string $cache_key Transient key prefix.
     * @param int    $pages     Number of pages to fetch.
     * @param string $source    Source label ('volksverpetzer' or 'pruefpunkt').
     *
     * @return array Normalised post array.
     */
    private static function fetch_wp_posts($base_url, $cache_key, $pages = 2, $source = 'volksverpetzer', bool $force = false)
    {
        $all_posts = [];

        for ($page = 1; $page <= $pages; $page++) {
            $key  = $cache_key . '_p' . $page;
            $url  = $base_url . '&page=' . $page . '&_cb=' . floor(time() / 1800);
            $data = self::fetch_json($url, $key, 1800, $force);

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
     * Fetch featured media for posts that lack _embedded data (e.g. pruefpunkt.org
     * does not support the _embed parameter) and inject a minimal _embedded structure
     * so the rest of the pipeline can use get_post_image() without changes.
     *
     * @param array  $posts            Posts array (modified in-place).
     * @param string $media_api_base   Base URL of the WP media endpoint, e.g.
     *                                 'https://pruefpunkt.org/wp-json/wp/v2/media'.
     * @param string $cache_key_prefix Transient key prefix for media results.
     * @param bool   $force            Bypass cache when true.
     *
     * @return array Posts with _embedded.wp:featuredmedia injected where available.
     */
    private static function hydrate_posts_with_media(array $posts, string $media_api_base, string $cache_key_prefix, bool $force = false): array
    {
        // Collect IDs that need fetching (skip posts that already have embedded media).
        $needed_ids = [];
        foreach ($posts as $post) {
            if (!empty($post['_embedded']['wp:featuredmedia'][0]['source_url'])) {
                continue;
            }
            $id = intval($post['featured_media'] ?? 0);
            if ($id > 0) {
                $needed_ids[$id] = true;
            }
        }

        if (empty($needed_ids)) {
            return $posts;
        }

        $ids_str   = implode(',', array_keys($needed_ids));
        $cache_key = $cache_key_prefix . '_media_' . substr(md5($ids_str), 0, 8);
        $url       = $media_api_base . '?include=' . $ids_str . '&per_page=100';

        $media_list = self::fetch_json($url, $cache_key, 1800, $force);

        if (!is_array($media_list)) {
            return $posts;
        }

        $media_map = [];
        foreach ($media_list as $media) {
            if (!empty($media['id'])) {
                $media_map[$media['id']] = $media;
            }
        }

        foreach ($posts as &$post) {
            $id = intval($post['featured_media'] ?? 0);
            if ($id > 0 && isset($media_map[$id])) {
                $post['_embedded']['wp:featuredmedia'] = [$media_map[$id]];
            }
        }
        unset($post);

        return $posts;
    }

    /**
     * Extract the featured image URL from a WP REST post array.
     *
     * @param array  $post      WP post array with _embedded data.
     * @param string $size_hint Preferred size key to look for in media_details.
     *
     * @return string Image URL or empty string.
     */
    private static function get_post_image($post, $size_hint = 'medium_large')
    {
        $media = $post['_embedded']['wp:featuredmedia'][0] ?? null;

        if (!$media) {
            return '';
        }

        $sizes = $media['media_details']['sizes'] ?? [];
        if (!empty($sizes[$size_hint]['source_url'])) {
            return $sizes[$size_hint]['source_url'];
        }

        if (!empty($sizes['full']['source_url'])) {
            return $sizes['full']['source_url'];
        }

        return $media['source_url'] ?? '';
    }

    private static function get_post_image_srcset($post)
    {
        $media = $post['_embedded']['wp:featuredmedia'][0] ?? null;
        if (!$media) {
            return '';
        }

        $sizes = $media['media_details']['sizes'] ?? [];
        $parts = [];
        $seen_widths = [];

        foreach (['medium', 'medium_large', 'large', 'full'] as $key) {
            if (empty($sizes[$key]['source_url']) || empty($sizes[$key]['width'])) {
                continue;
            }
            $w = intval($sizes[$key]['width']);
            if (isset($seen_widths[$w])) {
                continue;
            }
            $seen_widths[$w] = true;
            $parts[] = esc_url($sizes[$key]['source_url']) . ' ' . $w . 'w';
        }

        return implode(', ', $parts);
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
     * Extract the category URL from a WP REST post array.
     *
     * Uses the embedded link field if present, otherwise constructs the URL
     * from the category slug following the /category/{slug} pattern.
     *
     * @param array $post WP post array with _embedded data.
     *
     * @return string Category URL or empty string.
     */
    private static function get_post_category_link($post)
    {
        if (!empty($post['_embedded']['wp:term'][0][0]['link'])) {
            return $post['_embedded']['wp:term'][0][0]['link'];
        }

        $slug   = $post['_embedded']['wp:term'][0][0]['slug'] ?? '';
        $source = $post['_vvp_source'] ?? 'volksverpetzer';
        $domain = 'pruefpunkt' === $source ? 'https://pruefpunkt.org' : 'https://volksverpetzer.de';

        return $slug ? $domain . '/category/' . $slug : '';
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

        $namespaces = $xml->getNamespaces(true);
        $itunes_ns  = $namespaces['itunes'] ?? 'http://www.itunes.com/dtds/podcast-1.0.dtd';

        $channel_image  = '';
        $itunes_channel = $channel->children($itunes_ns);
        if (count($itunes_channel->image) > 0) {
            $channel_image = (string) ($itunes_channel->image->attributes()['href'] ?? '');
        }
        if (empty($channel_image) && !empty($channel->image->url)) {
            $channel_image = (string) $channel->image->url;
        }

        $items = [];
        foreach ($channel->item as $item) {
            $itunes_item   = $item->children($itunes_ns);
            $enclosure_url = '';
            if ($item->enclosure) {
                $enc_attrs     = $item->enclosure->attributes();
                $enclosure_url = (string) ($enc_attrs['url'] ?? '');
            }

            $item_image = '';
            if (count($itunes_item->image) > 0) {
                $item_img_attrs = $itunes_item->image->attributes();
                $item_image     = (string) ($item_img_attrs['href'] ?? '');
            }

            $items[] = [
                'title'     => (string) ($item->title ?? ''),
                'pubDate'   => (string) ($item->pubDate ?? ''),
                'link'      => (string) ($item->link ?? ''),
                'enclosure' => $enclosure_url,
                'duration'  => (string) ($itunes_item->duration ?? ''),
                'summary'   => (string) ($itunes_item->summary ?? $item->description ?? ''),
                'image'     => $item_image,
            ];
        }

        return [
            'channel_image' => $channel_image,
            'items'         => $items,
        ];
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

    /**
     * Force-refresh all external API transients used by ContentOverview.
     *
     * Fetches fresh data regardless of whether a valid transient already exists,
     * then overwrites it — so the old cached value stays readable until new data
     * arrives (stale-while-revalidate, no empty-cache window).
     *
     * Called by WP-Cron every 25 minutes via CronManager.
     */
    public static function warm_caches(): void
    {
        self::fetch_wp_posts(
            'https://volksverpetzer.de/wp-json/wp/v2/posts?per_page=12&_embed=1',
            'vvp_co_vp_posts',
            2,
            'volksverpetzer',
            true
        );
        $pp_posts = self::fetch_wp_posts(
            'https://pruefpunkt.org/wp-json/wp/v2/posts?per_page=10',
            'vvp_co_pp_posts',
            1,
            'pruefpunkt',
            true
        );
        self::hydrate_posts_with_media(
            $pp_posts,
            'https://pruefpunkt.org/wp-json/wp/v2/media',
            'vvp_co_pp',
            true
        );
        self::fetch_json('https://volksverpetzer-app.de/proxy/instaFeed', 'vvp_co_insta',   3600, true);
        self::fetch_json('https://volksverpetzer-app.de/proxy/instaFeed?account=pruefpunkt', 'vvp_co_insta_pp', 3600, true);
        self::fetch_json('https://volksverpetzer-app.de/proxy/ytAPI',     'vvp_co_yt',      3600, true);
        self::fetch_raw('https://volksverpetzer.podigee.io/feed/mp3',     'vvp_co_podcast', 3600, true);
    }
}
