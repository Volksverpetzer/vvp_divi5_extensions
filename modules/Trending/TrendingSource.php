<?php
/**
 * Shared "most read" data source for TrendingItems and TrendingList.
 *
 * Ranks articles by unique visitors from Plausible's Stats API (v2) when
 * VVP_PLAUSIBLE_TOKEN is defined, and falls back to WordPress Popular Posts
 * (wpp_get_ids) when Plausible isn't configured, the request fails, or it
 * yields no published posts -- so an outage degrades the ranking instead of
 * emptying the module.
 *
 * Configuration (wp-config.php):
 *   define('VVP_PLAUSIBLE_TOKEN', '...');            // Stats API key, required
 *   define('VVP_PLAUSIBLE_SITE_ID', 'example.org');  // optional, default volksverpetzer.de
 *
 * Callers cache the result (1h transient), so this is hit a handful of times
 * per hour -- far below Plausible's 600 requests/hour/key limit.
 *
 * @package VVP\Divi5\Trending
 */

namespace VVP\Divi5\Trending;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

class TrendingSource
{
    private const API_URL         = 'https://plausible.io/api/v2/query';
    private const DEFAULT_SITE_ID = 'volksverpetzer.de';
    private const REQUEST_TIMEOUT = 5;

    /**
     * Plausible returns at most this many pages; more than the callers ever
     * ask for (min(count * 5, 100)) leaves headroom for pages that don't map
     * to a published post (homepage, categories, author archives, ...).
     */
    private const PAGE_LIMIT = 200;

    /** Module "Zeitraum" option => rolling window in seconds. */
    private const RANGES = [
        'last24hours' => \DAY_IN_SECONDS,
        'last7days'   => 7 * \DAY_IN_SECONDS,
        'last30days'  => 30 * \DAY_IN_SECONDS,
    ];

    /**
     * IDs of the most-read published posts in the range, most-read first.
     *
     * @return list<int>
     */
    public static function get_top_post_ids(int $limit, string $range): array
    {
        if ($limit <= 0) {
            return [];
        }

        $ids = self::fetch_plausible_ids($limit, $range);

        return !empty($ids) ? $ids : self::fetch_wpp_ids($limit, $range);
    }

    /**
     * @return list<int> [] when Plausible isn't configured or the request fails.
     */
    private static function fetch_plausible_ids(int $limit, string $range): array
    {
        if (!defined('VVP_PLAUSIBLE_TOKEN') || '' === (string) \VVP_PLAUSIBLE_TOKEN) {
            return [];
        }

        $site_id = defined('VVP_PLAUSIBLE_SITE_ID') && '' !== (string) \VVP_PLAUSIBLE_SITE_ID
            ? (string) \VVP_PLAUSIBLE_SITE_ID
            : self::DEFAULT_SITE_ID;

        $response = wp_remote_post(self::API_URL, [
            'timeout' => self::REQUEST_TIMEOUT,
            'headers' => [
                'Authorization' => 'Bearer ' . \VVP_PLAUSIBLE_TOKEN,
                'Content-Type'  => 'application/json',
            ],
            'body'    => (string) wp_json_encode(self::build_query($site_id, $range, time())),
        ]);

        if (is_wp_error($response)) {
            error_log('[vvp-divi5] Plausible trending query failed: ' . $response->get_error_message());
            return [];
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        if (200 !== $code) {
            error_log("[vvp-divi5] Plausible trending query returned HTTP {$code}");
            return [];
        }

        $data = json_decode((string) wp_remote_retrieve_body($response), true);

        return self::map_paths_to_post_ids(self::extract_paths($data), $limit);
    }

    /**
     * Plausible v2 query: unique visitors per page over a rolling window
     * ending now. An explicit datetime range instead of "day"/"7d"/"30d",
     * because those are calendar-based ("day" = today since midnight).
     *
     * @return array<string, mixed>
     */
    public static function build_query(string $site_id, string $range, int $now): array
    {
        $window = self::RANGES[$range] ?? self::RANGES['last7days'];

        return [
            'site_id'    => $site_id,
            'metrics'    => ['visitors'],
            'dimensions' => ['event:page'],
            'date_range' => [gmdate(\DATE_ATOM, $now - $window), gmdate(\DATE_ATOM, $now)],
            'filters'    => [['is_not', 'event:page', ['/']]],
            'order_by'   => [['visitors', 'desc']],
            'pagination' => ['limit' => self::PAGE_LIMIT],
        ];
    }

    /**
     * Page paths from a Plausible v2 response, in result order.
     *
     * @param mixed $data Decoded response body.
     * @return list<string>
     */
    public static function extract_paths($data): array
    {
        if (!is_array($data) || !isset($data['results']) || !is_array($data['results'])) {
            return [];
        }

        $paths = [];
        foreach ($data['results'] as $row) {
            $path = $row['dimensions'][0] ?? null;
            if (is_string($path) && '' !== $path && '/' === $path[0]) {
                $paths[] = $path;
            }
        }

        return $paths;
    }

    /**
     * Resolves paths to published post IDs, keeping order, dropping
     * duplicates (e.g. a post reached via two URLs) and anything that isn't a
     * published post.
     *
     * @param list<string> $paths
     * @return list<int>
     */
    public static function map_paths_to_post_ids(array $paths, int $limit): array
    {
        $ids = [];
        foreach ($paths as $path) {
            if (count($ids) >= $limit) {
                break;
            }

            $post_id = (int) url_to_postid(home_url($path));
            if ($post_id <= 0 || in_array($post_id, $ids, true)) {
                continue;
            }

            $post = get_post($post_id);
            if ($post && 'post' === $post->post_type && 'publish' === $post->post_status) {
                $ids[] = $post_id;
            }
        }

        return $ids;
    }

    /**
     * Fallback: top post IDs via WordPress Popular Posts. [] when WPP is not active.
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
}
