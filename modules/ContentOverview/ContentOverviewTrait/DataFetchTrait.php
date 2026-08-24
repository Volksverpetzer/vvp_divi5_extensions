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
     * A warm cache is served without any network call. A cold or expired entry
     * is refreshed over the wire by at most one request at a time — the refresh
     * lock holder — or by the WP-Cron warmer ($force = true); other concurrent
     * requests serve the last good value (or null) instead of piling onto the
     * upstream. Any failure likewise serves the last good value rather than
     * dropping the section or hammering a broken upstream.
     *
     * @param string $url       Remote URL to fetch.
     * @param string $cache_key Transient key.
     * @param int    $ttl       Cache lifetime in seconds.
     * @param bool   $force      Refresh over the wire (WP-Cron warmer only).
     *
     * @return mixed|null Decoded JSON body, stale cached value, or null.
     */
    private static function fetch_json($url, $cache_key, $ttl = 1800, bool $force = false)
    {
        $cached = get_transient($cache_key);

        // Warm cache on a render request: serve it, never touch the network.
        if (false !== $cached && !$force) {
            return $cached;
        }

        // Cache miss or forced refresh. Only the lock holder fetches; concurrent
        // visitors serve stale data (or null) and return immediately so a slow
        // upstream can't saturate the PHP-FPM pool.
        if (!$force && !self::acquire_refresh_lock($cache_key)) {
            return false === $cached ? null : $cached;
        }

        $response = wp_remote_get($url, [
            'timeout'    => 3,
            'user-agent' => 'VVP-ContentOverview/1.0',
        ]);

        // Default to the stale value; overwrite only on a fully successful fetch.
        $result = $cached;
        if (!is_wp_error($response) && 200 === (int) wp_remote_retrieve_response_code($response)) {
            $data = json_decode(wp_remote_retrieve_body($response), true);
            if (null !== $data) {
                set_transient($cache_key, $data, $ttl);
                $result = $data;
            }
        }

        // Release only after the cache write, so a second request can't acquire
        // the lock and start a duplicate fetch during decode/set_transient.
        if (!$force) {
            self::release_refresh_lock($cache_key);
        }

        return false === $result ? null : $result;
    }

    /**
     * Fetch a remote URL and return the raw body string, with transient caching.
     *
     * @param string $url       Remote URL.
     * @param string $cache_key Transient key.
     * @param int    $ttl       Cache lifetime in seconds.
     * @param bool   $force      Refresh over the wire (WP-Cron warmer only).
     *
     * @return string|null Raw body, stale cached value, or null.
     */
    private static function fetch_raw($url, $cache_key, $ttl = 3600, bool $force = false)
    {
        $cached = get_transient($cache_key);

        // Warm cache on a render request: serve it, never touch the network.
        if (false !== $cached && !$force) {
            return $cached;
        }

        // Cache miss or forced refresh — see fetch_json() for the lock rationale.
        if (!$force && !self::acquire_refresh_lock($cache_key)) {
            return false === $cached ? null : $cached;
        }

        $response = wp_remote_get($url, [
            'timeout'    => 3,
            'user-agent' => 'VVP-ContentOverview/1.0',
        ]);

        // Default to the stale value; overwrite only on a non-empty 200 response.
        $result = $cached;
        if (!is_wp_error($response) && 200 === (int) wp_remote_retrieve_response_code($response)) {
            $body = wp_remote_retrieve_body($response);
            if ('' !== $body) {
                set_transient($cache_key, $body, $ttl);
                $result = $body;
            }
        }

        // Release only after the cache write, so a second request can't acquire
        // the lock and start a duplicate fetch during set_transient.
        if (!$force) {
            self::release_refresh_lock($cache_key);
        }

        return false === $result ? null : $result;
    }

    /**
     * Acquire a short-lived refresh lock for a cache key.
     *
     * Prevents a cache stampede: when a transient is cold or expired, only the
     * process that wins the lock refreshes it over the network; concurrent
     * requests serve stale data (or null) and return without blocking. The lock
     * auto-expires so a crashed request can't wedge a key permanently.
     *
     * With a persistent object cache (e.g. Redis on production) the lock uses
     * wp_cache_add(), which is atomic — it fails if the key already exists, with
     * no check-then-set race. Without one it falls back to a transient lock,
     * whose tiny get/set window is still far shorter than a multi-second fetch.
     *
     * @param string $cache_key Transient key being refreshed.
     *
     * @return bool True if the lock was acquired and the caller should fetch.
     */
    private static function acquire_refresh_lock(string $cache_key): bool
    {
        $lock_key = $cache_key . '_lock';

        if (wp_using_ext_object_cache()) {
            return wp_cache_add($lock_key, 1, 'vvp_co_lock', 15);
        }

        if (false !== get_transient($lock_key)) {
            return false;
        }
        // Treat a failed write as "lock not acquired" so the caller serves stale
        // rather than fetching without a lock and risking a concurrent refresh.
        return set_transient($lock_key, 1, 15);
    }

    /**
     * Release a refresh lock acquired via acquire_refresh_lock().
     *
     * Must mirror the backend chosen by acquire_refresh_lock(), otherwise an
     * object-cache lock would linger until its TTL after a successful refresh.
     *
     * @param string $cache_key Transient key that was being refreshed.
     */
    private static function release_refresh_lock(string $cache_key): void
    {
        $lock_key = $cache_key . '_lock';

        if (wp_using_ext_object_cache()) {
            wp_cache_delete($lock_key, 'vvp_co_lock');
            return;
        }

        delete_transient($lock_key);
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
     * @param bool   $force    Probe over the wire (WP-Cron warmer only).
     *
     * @return bool True if the video is a Short (should be filtered out).
     */
    private static function is_youtube_short(string $video_id, bool $force = false): bool
    {
        if (empty($video_id)) {
            return false;
        }

        $cache_key = 'vvp_co_yt_short_' . $video_id;
        $cached    = get_transient($cache_key);
        if (false !== $cached) {
            return (bool) $cached;
        }

        // Read-only on the render path: an unprobed video is treated as a
        // regular video (kept) so a visitor request never makes a live call to
        // youtube.com. The probe only runs from the WP-Cron warmer ($force),
        // which populates this transient ahead of time.
        if (!$force) {
            return false;
        }

        $url      = 'https://www.youtube.com/shorts/' . rawurlencode($video_id);
        $response = wp_remote_head($url, [
            'timeout'     => 3,
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
     * Determine whether a YouTube video is a Short from its actual duration.
     *
     * The ytAPI proxy fetches contentDetails.duration alongside the snippet, so
     * this is a synchronous, data-only check — no network probe needed, unlike
     * is_youtube_short(). Duration is YouTube's own definition of a Short
     * (currently <= 3 minutes) and is available immediately for every video, so
     * it should never let a Short slip through the way an unprobed video could.
     *
     * Falls back to the URL-probe check for items cached before the proxy
     * started returning contentDetails (no duration field yet).
     *
     * @param array $video Raw video item from the ytAPI proxy.
     *
     * @return bool True if the video is a Short (should be filtered out).
     */
    private static function is_youtube_short_video(array $video): bool
    {
        $duration = $video['contentDetails']['duration'] ?? '';

        if ('' !== $duration && preg_match('/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/', $duration, $matches)) {
            $hours   = isset($matches[1]) ? (int) $matches[1] : 0;
            $minutes = isset($matches[2]) ? (int) $matches[2] : 0;
            $seconds = isset($matches[3]) ? (int) $matches[3] : 0;

            return ($hours * 3600 + $minutes * 60 + $seconds) < self::YT_SHORT_MAX_SECONDS;
        }

        return self::is_youtube_short($video['id'] ?? '');
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
            // Long TTL: the cron warmer refreshes every 25 min, so a generous
            // lifetime just keeps stale data alive if cron or the upstream dies.
            $data = self::fetch_json($url, $key, 12 * \HOUR_IN_SECONDS, $force);

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

        $media_list = self::fetch_json($url, $cache_key, 12 * \HOUR_IN_SECONDS, $force);

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
     * Fetch Volksverpetzer articles — the site's own posts.
     *
     * Prefers a local database query: the REST route goes through the public
     * domain and BunnyCDN, which caches /wp-json/ responses aggressively and
     * ignores the cache-buster, so REST data can lag behind by hours. The
     * local query is always current and never leaves the process.
     *
     * The REST fetch remains as a fallback for runtimes without WordPress
     * (dev-preview.php) and for the unexpected case of an empty local result.
     *
     * @param bool $force Bypass the REST transient and refresh it (fallback path only).
     *
     * @return array WP-REST-shaped post arrays.
     */
    private static function fetch_volksverpetzer_articles(bool $force = false): array
    {
        if (class_exists('\WP_Query')) {
            $posts = self::query_local_volksverpetzer_articles();
            if (!empty($posts)) {
                return $posts;
            }
        }

        return self::fetch_volksverpetzer_articles_rest($force);
    }

    /**
     * Fetch Volksverpetzer articles from the WP REST API (fallback path).
     *
     * Single source of truth for the endpoint, transient key and page count —
     * used by both the render fallback and the WP-Cron cache warmer.
     *
     * @param bool $force Bypass the transient and refresh it.
     *
     * @return array WP post arrays.
     */
    private static function fetch_volksverpetzer_articles_rest(bool $force = false): array
    {
        return self::fetch_wp_posts(
            'https://volksverpetzer.de/wp-json/wp/v2/posts?per_page=12&_embed=1',
            'vvp_co_vp_posts',
            2,
            'volksverpetzer',
            $force
        );
    }

    /**
     * Query the newest Volksverpetzer posts from the local database and map
     * them to the WP-REST array shape the rest of the pipeline consumes.
     *
     * The mapped result is kept in a short transient: the mapping touches
     * permalinks, terms, thumbnails and Yoast meta for two dozen posts, which
     * is worth skipping on every uncached page view. Five minutes of staleness
     * is harmless here — the hero post is excluded by ID from a live query,
     * so a lagging list can only delay a brand-new article's first feed
     * appearance by the TTL, never drop the wrong article.
     *
     * @return array WP-REST-shaped post arrays (newest first).
     */
    private static function query_local_volksverpetzer_articles(): array
    {
        $cache_key = self::LOCAL_POSTS_TRANSIENT;
        $cached    = get_transient($cache_key);
        if (is_array($cached) && !empty($cached)) {
            return $cached;
        }

        $query = new \WP_Query([
            'post_type'           => 'post',
            'post_status'         => 'publish',
            'posts_per_page'      => 24,
            'ignore_sticky_posts' => true,
            'no_found_rows'       => true,
        ]);

        $posts = [];
        foreach ($query->posts as $wp_post) {
            $posts[] = self::map_local_post($wp_post);
        }

        if (!empty($posts)) {
            set_transient($cache_key, $posts, 5 * \MINUTE_IN_SECONDS);
        }

        return $posts;
    }

    /**
     * Map a local WP_Post to the WP-REST post array shape used by the card
     * renderer (title.rendered, _embedded media/author/terms, yoast_head_json).
     *
     * @param \WP_Post $wp_post Post object.
     *
     * @return array WP-REST-shaped post array.
     */
    private static function map_local_post(\WP_Post $wp_post): array
    {
        $id = (int) $wp_post->ID;

        $post = [
            'id'              => $id,
            // Site-local time without offset, matching the REST 'date' field.
            'date'            => get_post_time('Y-m-d\TH:i:s', false, $wp_post),
            'link'            => get_permalink($wp_post),
            'title'           => ['rendered' => get_the_title($wp_post)],
            'reading_time'    => self::local_reading_time($id),
            'yoast_head_json' => ['description' => self::local_meta_description($id)],
            '_vvp_source'     => 'volksverpetzer',
        ];

        $author_names = self::get_author_names($wp_post);
        if (!empty($author_names)) {
            $post['_embedded']['author'] = array_map(
                static fn (string $name): array => ['name' => $name],
                $author_names
            );
        }

        $categories = get_the_category($id);
        if (!empty($categories)) {
            $category = $categories[0];
            $link     = get_category_link((int) $category->term_id);
            $post['_embedded']['wp:term'] = [[[
                'name' => $category->name,
                'slug' => $category->slug,
                'link' => is_string($link) ? $link : '',
            ]]];
        }

        $thumb_id = get_post_thumbnail_id($wp_post);
        if ($thumb_id) {
            $sizes = [];
            foreach (['medium', 'medium_large', 'large', 'full'] as $size) {
                $src = wp_get_attachment_image_src($thumb_id, $size);
                if (is_array($src) && !empty($src[0])) {
                    $sizes[$size] = [
                        'source_url' => $src[0],
                        'width'      => (int) $src[1],
                    ];
                }
            }
            $full_url = $sizes['full']['source_url'] ?? wp_get_attachment_url($thumb_id);
            if ($full_url) {
                $post['_embedded']['wp:featuredmedia'] = [[
                    'source_url'    => $full_url,
                    'media_details' => ['sizes' => $sizes],
                ]];
            }
        }

        return $post;
    }

    /**
     * Reads all co-authors for a post from PublishPress Authors (if active),
     * falling back to the single WordPress core post author -- same pattern
     * as TrendingList/TrendingListTrait/RenderCallbackTrait.php.
     *
     * get_post_authors() is PublishPress Authors' current, non-deprecated
     * per-post template tag (get_multiple_authors() and
     * publishpress_authors_get_post_authors() both exist but are marked
     * @deprecated in favor of it).
     *
     * @return list<string>
     */
    private static function get_author_names(\WP_Post $wp_post): array
    {
        if (function_exists('get_post_authors')) {
            $authors = get_post_authors($wp_post->ID);
            $authors = is_array($authors) ? $authors : [];
            $names   = array_values(array_filter(array_map(
                static fn ($author) => (string) ($author->display_name ?? ''),
                $authors
            )));

            if (!empty($names)) {
                return $names;
            }
        }

        $author_name = get_the_author_meta('display_name', (int) $wp_post->post_author);
        return $author_name ? [$author_name] : [];
    }

    /**
     * Yoast estimated reading time in minutes for a post, 0 when unavailable.
     *
     * Mirrors the 'reading_time' field the REST payload carries.
     *
     * @param int $post_id Post ID.
     *
     * @return int Minutes.
     */
    private static function local_reading_time(int $post_id): int
    {
        // Prefer the stored meta (same source TrendingItems uses): a plain
        // postmeta read, no coupling to Yoast's runtime surfaces.
        $minutes = (int) get_post_meta($post_id, '_yoast_wpseo_estimated-reading-time-minutes', true);
        if ($minutes > 0) {
            return $minutes;
        }

        // Fallback for posts saved before Yoast started writing that meta.
        if (!function_exists('YoastSEO')) {
            return 0;
        }
        try {
            return (int) YoastSEO()->meta->for_post($post_id)->estimated_reading_time_minutes;
        } catch (\Throwable $e) {
            return 0;
        }
    }

    /**
     * Meta description for a post: Yoast's (possibly template-generated)
     * description, falling back to a truncated excerpt.
     *
     * Mirrors yoast_head_json.description in the REST payload.
     *
     * @param int $post_id Post ID.
     *
     * @return string Description or empty string.
     */
    private static function local_meta_description(int $post_id): string
    {
        if (function_exists('YoastSEO')) {
            try {
                $description = (string) YoastSEO()->meta->for_post($post_id)->description;
                if ('' !== $description) {
                    return $description;
                }
            } catch (\Throwable $e) {
                // Fall through to the excerpt.
            }
        }

        $excerpt = get_the_excerpt($post_id);
        return $excerpt ? self::truncate($excerpt, 160) : '';
    }

    /**
     * Fetch Prüfpunkt articles (with featured media hydrated) from the WP REST API.
     *
     * @param bool $force Bypass the transients and refresh them.
     *
     * @return array WP post arrays.
     */
    private static function fetch_pruefpunkt_articles(bool $force = false): array
    {
        $posts = self::fetch_wp_posts(
            'https://pruefpunkt.org/wp-json/wp/v2/posts?per_page=10',
            'vvp_co_pp_posts',
            1,
            'pruefpunkt',
            $force
        );
        return self::hydrate_posts_with_media(
            $posts,
            'https://pruefpunkt.org/wp-json/wp/v2/media',
            'vvp_co_pp',
            $force
        );
    }

    /**
     * Fetch an Instagram feed from the proxy.
     *
     * @param string $account Instagram account ('volksverpetzer' or 'pruefpunkt').
     * @param bool   $force   Bypass the transient and refresh it.
     *
     * @return array Instagram post arrays.
     */
    private static function fetch_insta_feed(string $account = 'volksverpetzer', bool $force = false): array
    {
        $url = 'https://volksverpetzer-app.de/proxy/instaFeed';
        $key = 'vvp_co_insta';
        if ('pruefpunkt' === $account) {
            $url .= '?account=pruefpunkt';
            $key .= '_pp';
        }
        $raw   = self::fetch_json($url, $key, 12 * \HOUR_IN_SECONDS, $force);
        $posts = is_array($raw['data'] ?? null) ? $raw['data'] : [];

        // Tag each post with its account: the proxy payload carries no account
        // info, and the card renderer needs it for account-specific fallbacks.
        foreach ($posts as &$post) {
            $post['_vvp_ig_account'] = $account;
        }
        unset($post);

        return $posts;
    }

    /**
     * Fetch the YouTube feed from the proxy.
     *
     * @param bool $force Bypass the transient and refresh it.
     *
     * @return array Normalised video arrays.
     */
    private static function fetch_yt_feed(bool $force = false): array
    {
        $raw = self::fetch_json('https://volksverpetzer-app.de/proxy/ytAPI', 'vvp_co_yt', 12 * \HOUR_IN_SECONDS, $force);
        return is_array($raw['items'] ?? null) ? $raw['items'] : [];
    }

    /**
     * Fetch the podcast RSS feed.
     *
     * @param bool $force Bypass the transient and refresh it.
     *
     * @return string|null Raw feed XML or null on failure.
     */
    private static function fetch_podcast_xml(bool $force = false)
    {
        return self::fetch_raw('https://volksverpetzer.podigee.io/feed/mp3', 'vvp_co_podcast', 12 * \HOUR_IN_SECONDS, $force);
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
        // Warm the REST transient directly: the render path prefers the local
        // query, so warming through fetch_volksverpetzer_articles() would be a
        // no-op — but the REST fallback should stay reasonably fresh.
        self::fetch_volksverpetzer_articles_rest(true);
        self::fetch_pruefpunkt_articles(true);
        self::fetch_insta_feed('volksverpetzer', true);
        self::fetch_insta_feed('pruefpunkt', true);

        // Probe each video's Short status over the wire here so the render path
        // can read the result from cache instead of calling youtube.com itself.
        // Bounded by both a count cap and a wall-clock budget so a large feed or
        // a slow/down youtube.com can't make the cron run unbounded (worst case
        // would otherwise be ~30 probes x 3s). Anything not probed this run stays
        // cache-only on render and gets picked up by a later run.
        $videos   = self::fetch_yt_feed(true);
        $probed   = 0;
        $deadline = microtime(true) + 15;
        foreach ($videos as $video) {
            if ($probed >= 30 || microtime(true) >= $deadline) {
                break;
            }
            $id = $video['id'] ?? '';
            if ('' === $id) {
                continue;
            }
            self::is_youtube_short($id, true);
            $probed++;
        }

        self::fetch_podcast_xml(true);
    }
}
