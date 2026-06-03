<?php
/**
 * HTML card rendering helpers for each content kind.
 *
 * @package VVP\Divi5\ContentOverview
 * @since 1.0.0
 */

namespace VVP\Divi5\ContentOverview\ContentOverviewTrait;

trait CardRenderTrait
{
    /**
     * Render a featured article card for the feed grid.
     * Emits a React mount point hydrated by content-overview-frontend.js.
     *
     * @param array $post WP post array.
     *
     * @return string HTML.
     */
    private static function render_featured_card($post)
    {
        $props = [
            'type'          => 'article',
            'title'         => html_entity_decode(wp_strip_all_tags($post['title']['rendered'] ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'link'          => $post['link'] ?? '',
            'date'          => self::format_date($post['date'] ?? ''),
            'image_url'     => self::get_post_image($post, 'medium_large'),
            'excerpt'       => $post['yoast_head_json']['description'] ?? '',
            'author'        => $post['_embedded']['author'][0]['name'] ?? '',
            'reading_time'  => (int) ($post['reading_time'] ?? 0),
            'category'      => self::get_post_category($post),
            'category_link' => self::get_post_category_link($post),
            'source'        => $post['_vvp_source'] ?? 'volksverpetzer',
        ];

        $image_html = $props['image_url']
            ? '<img src="' . esc_url($props['image_url']) . '" alt="' . esc_attr($props['title']) . '" class="vvp-co__feed-image" loading="lazy" decoding="async">'
            : '';
        $category_html = ($props['category'] && $props['category_link'])
            ? '<a href="' . esc_url($props['category_link']) . '" class="vvp-co__category">' . esc_html($props['category']) . '</a>'
            : ($props['category'] ? '<span class="vvp-co__category">' . esc_html($props['category']) . '</span>' : '');
        $reading_time_html = $props['reading_time']
            ? '<span class="vvp-co__reading-time">' . (int) $props['reading_time'] . ' Min.</span>'
            : '';

        $static_html = '<a href="' . esc_url($props['link']) . '" class="vvp-co__feed-card">'
            . ($image_html ? '<div class="vvp-co__feed-image-wrap">' . $image_html . '</div>' : '')
            . '<div class="vvp-co__feed-body">'
            .   '<h3 class="vvp-co__feed-title">' . esc_html($props['title']) . '</h3>'
            .   ($props['excerpt'] ? '<p class="vvp-co__feed-excerpt">' . esc_html($props['excerpt']) . '</p>' : '')
            .   '<div class="vvp-co__feed-footer">'
            .     $category_html
            .     '<span class="vvp-co__feed-date">' . esc_html($props['date']) . '</span>'
            .     $reading_time_html
            .   '</div>'
            . '</div>'
            . '</a>';

        return '<div class="vvp-co-article-mount" data-article-props="'
            . esc_attr(wp_json_encode($props))
            . '">' . $static_html . '</div>';
    }

    /**
     * Render an Instagram card for the feed grid.
     *
     * CAROUSEL_ALBUM posts render all child images as individual slides.
     * Single IMAGE/VIDEO posts render as a one-slide item.
     * The React InstagramSlideshow component is mounted client-side via
     * content-overview-frontend.js reading the data-ig-props attribute.
     *
     * @param array $post Instagram post data from the proxy API.
     *
     * @return string HTML mount point.
     */
    private static function render_insta_card($post)
    {
        $media_type = $post['media_type'] ?? '';
        $permalink  = esc_url($post['permalink'] ?? 'https://www.instagram.com/volksverpetzer/');
        $caption    = $post['caption'] ?? '';
        $date       = esc_html(self::format_date($post['timestamp'] ?? ''));

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

        $is_carousel   = count($slides) > 1;
        $media_category = 'VIDEO' === $media_type ? 'Video' : ($is_carousel ? 'Karussell' : 'Foto');

        // Extract the shortcode from e.g. https://www.instagram.com/p/ABC123/
        $post_id = '';
        if (preg_match('#/p/([^/?\\#]+)#', $permalink, $m)) {
            $post_id = $m[1];
        }

        $props = [
            'permalink'     => $permalink,
            'postId'        => $post_id,
            'caption'       => $caption,
            'date'          => $date,
            'badgeLabel'    => 'Instagram',
            'mediaCategory' => $media_category,
            'slides'        => $slides,
            'isCarousel'    => $is_carousel,
        ];

        return '<div class="vvp-co-ig-mount" data-ig-props="' . esc_attr(json_encode($props)) . '"></div>';
    }

    /**
     * Render a YouTube card for the feed grid.
     *
     * @param array $video Normalised YouTube video data (id, title, description, publishedAt, thumbnailUrl).
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

        $image_html = $thumb_url
            ? '<div class="vvp-co__feed-image-wrap vvp-co__feed-image-wrap--yt">'
                . '<img src="' . $thumb_url . '" alt="' . esc_attr($title) . '" class="vvp-co__feed-image" loading="lazy" decoding="async">'
                . '<div class="vvp-co__yt-play-btn" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>'
                . '</div>'
            : '';

        $yt_badge = '<span class="vvp-co__badge vvp-co__badge--youtube">'
            . '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 461.001 461.001" fill="currentColor" aria-hidden="true"><path d="M365.257 67.393H95.744C42.866 67.393 0 110.259 0 163.137v134.728c0 52.878 42.866 95.744 95.744 95.744h269.513c52.878 0 95.744-42.866 95.744-95.744V163.137c0-52.878-42.866-95.744-95.744-95.744zm-64.751 169.663l-126.06 60.123c-3.359 1.602-7.239-.847-7.239-4.568V168.607c0-3.774 3.982-6.22 7.348-4.514l126.06 63.943c3.748 1.899 3.683 7.274-.109 9.02z"/></svg>'
            . 'YouTube</span>';

        return '<a href="' . $yt_url . '" class="vvp-co__feed-card vvp-co__feed-card--youtube" target="_blank" rel="noopener noreferrer">'
            . $image_html
            . '<div class="vvp-co__feed-body">'
            .   '<h3 class="vvp-co__feed-title">' . $title . '</h3>'
            .   ($description ? '<p class="vvp-co__feed-excerpt">' . $description . '</p>' : '')
            .   '<div class="vvp-co__feed-footer">'
            .     $yt_badge
            .     '<span class="vvp-co__feed-date">' . $date . '</span>'
            .   '</div>'
            . '</div>'
            . '</a>';
    }

    /**
     * Render the full-width YouTube banner mount point.
     *
     * The React YouTubeBanner component is mounted client-side via
     * content-overview-frontend.js reading the data-yt-banner-props attribute.
     *
     * @param array $video Normalised YouTube video data.
     *
     * @return string HTML mount point.
     */
    private static function render_youtube_banner($video)
    {
        $props = [
            'videoId'      => $video['id'] ?? '',
            'title'        => $video['title'] ?? '',
            'description'  => self::truncate($video['description'] ?? '', 200),
            'date'         => self::format_date($video['publishedAt'] ?? ''),
            'thumbnailUrl' => $video['thumbnailUrl'] ?? '',
        ];

        $encoded  = htmlspecialchars(json_encode($props, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ENT_QUOTES, 'UTF-8');
        $yt_url   = $props['videoId'] ? esc_url('https://youtube.com/watch?v=' . $props['videoId']) : '#';
        $yt_title = esc_html($props['title']);
        $yt_desc  = esc_html($props['description']);
        $yt_date  = esc_html($props['date']);

        $static_html = '<a href="' . $yt_url . '" target="_blank" rel="noopener noreferrer">'
            . ($props['thumbnailUrl'] ? '<img src="' . esc_url($props['thumbnailUrl']) . '" alt="' . $yt_title . '" loading="lazy" decoding="async">' : '')
            . '<div><h3>' . $yt_title . '</h3>'
            . ($yt_desc ? '<p>' . $yt_desc . '</p>' : '')
            . '<span>' . $yt_date . '</span></div>'
            . '</a>';

        return '<div class="vvp-co-yt-banner-mount" data-yt-banner-props="' . $encoded . '">' . $static_html . '</div>';
    }

    /**
     * Render the full-width podcast banner mount point.
     *
     * The React PodcastBanner component is mounted client-side via
     * content-overview-frontend.js reading the data-podcast-props attribute.
     *
     * @param array  $episode       Podcast episode data.
     * @param string $channel_image Channel artwork URL.
     *
     * @return string HTML mount point.
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
            'artworkUrl' => !empty($episode['image']) ? $episode['image'] : $channel_image,
        ];

        $encoded         = htmlspecialchars(json_encode($props, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ENT_QUOTES, 'UTF-8');
        $pod_title       = esc_html($props['title']);
        $pod_link        = esc_url($props['link']);
        $pod_date        = esc_html($props['date']);
        $pod_summary     = esc_html($props['summary']);
        $pod_duration    = esc_html($props['duration']);

        $static_html = '<a href="' . $pod_link . '">'
            . ($props['artworkUrl'] ? '<img src="' . esc_url($props['artworkUrl']) . '" alt="' . $pod_title . '" loading="lazy">' : '')
            . '<div><h3>' . $pod_title . '</h3>'
            . ($pod_summary ? '<p>' . $pod_summary . '</p>' : '')
            . '<span>' . $pod_date . ($pod_duration ? ' · ' . $pod_duration : '') . '</span></div>'
            . '</a>';

        return '<div class="vvp-co-podcast-mount" data-podcast-props="' . $encoded . '">' . $static_html . '</div>';
    }
}
