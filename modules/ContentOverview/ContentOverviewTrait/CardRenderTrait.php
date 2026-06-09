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
            ? '<div class="vvp-co__feed-image-wrap">'
            .   '<img src="' . esc_url($props['image_url']) . '" alt="' . esc_attr($props['title']) . '" class="vvp-co__feed-image" loading="lazy" decoding="async">'
            . '</div>'
            : '';

        $source_badge = $props['source'] === 'pruefpunkt'
            ? '<span class="vvp-co__badge vvp-co__badge--pruefpunkt">Prüfpunkt</span>'
            : '<span class="vvp-co__badge vvp-co__badge--vvp">VVP</span>';

        $category_html = '';
        if ($props['category']) {
            $category_html = $props['category_link']
                ? '<span role="button" tabindex="0" class="vvp-co__category vvp-co__category--btn">' . esc_html($props['category']) . '</span>'
                : '<span class="vvp-co__category">' . esc_html($props['category']) . '</span>';
        }

        $clock_svg = '<svg aria-hidden="true" focusable="false" data-icon="clock" width="14" height="14" fill="none" stroke="currentColor" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
            . '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
            . '</svg>';
        $reading_time_html = $props['reading_time']
            ? '<span class="vvp-co__feed-reading-time">' . $clock_svg . (int) $props['reading_time'] . ' Min.</span>'
            : '';

        $excerpt_html = '';
        if ($props['excerpt']) {
            $excerpt_html = '<p class="vvp-co__feed-excerpt">' . esc_html($props['excerpt']);
            if ($props['author']) {
                $excerpt_html .= '<em class="vvp-co__feed-author"> – ' . esc_html($props['author']) . '</em>';
            }
            $excerpt_html .= '</p>';
        }

        $static_html = '<a href="' . esc_url($props['link']) . '" class="vvp-co__feed-card vvp-co__feed-card--article" target="_blank" rel="noopener noreferrer">'
            . $image_html
            . '<div class="vvp-co__feed-body">'
            .   '<h3 class="vvp-co__feed-title">' . esc_html($props['title']) . '</h3>'
            .   $excerpt_html
            .   '<div class="vvp-co__feed-footer">'
            .     $source_badge
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

        $yt_youtube_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 461 461" fill="currentColor" aria-hidden="true" style="margin-right: 4px;">'
            . '<path d="M365.257 67.393H95.744C42.866 67.393 0 110.259 0 163.137v134.728c0 52.878 42.866 95.744 95.744 95.744h269.513c52.878 0 95.744-42.866 95.744-95.744V163.137c0-52.878-42.866-95.744-95.744-95.744zm-64.751 169.663l-126.06 60.123c-3.359 1.602-7.239-.847-7.239-4.568V168.607c0-3.774 3.982-6.22 7.348-4.514l126.06 63.943c3.748 1.899 3.683 7.274-.109 9.02z"/>'
            . '</svg>';
        $yt_play_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="white">'
            . '<path d="M8 5v14l11-7z"/>'
            . '</svg>';

        $static_html = '<div class="vvp-co__yt-banner">'
            .   '<div class="vvp-co__yt-banner-inner">'
            .     '<div class="vvp-co__yt-banner-thumb-wrap">'
            .       '<button type="button" class="vvp-co__yt-banner-thumb-btn" aria-label="' . esc_attr($props['title']) . ' abspielen">'
            .         ($props['thumbnailUrl'] ? '<img src="' . esc_url($props['thumbnailUrl']) . '" alt="' . esc_attr($props['title']) . '" class="vvp-co__yt-banner-thumb" loading="lazy" decoding="async">' : '')
            .         '<div class="vvp-co__yt-banner-play" aria-hidden="true">' . $yt_play_icon . '</div>'
            .       '</button>'
            .     '</div>'
            .     '<div class="vvp-co__yt-banner-content">'
            .       '<div class="vvp-co__yt-banner-label">'
            .         '<span class="vvp-co__badge vvp-co__badge--youtube">' . $yt_youtube_icon . 'YouTube</span>'
            .       '</div>'
            .       '<a href="' . $yt_url . '" class="vvp-co__yt-banner-title" target="_blank" rel="noopener noreferrer">' . $yt_title . '</a>'
            .       ($yt_desc ? '<p class="vvp-co__yt-banner-description">' . $yt_desc . '</p>' : '')
            .       '<div class="vvp-co__yt-banner-footer">'
            .         '<span class="vvp-co__yt-banner-date">' . $yt_date . '</span>'
            .       '</div>'
            .     '</div>'
            .   '</div>'
            . '</div>';

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

        $encoded     = htmlspecialchars(json_encode($props, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ENT_QUOTES, 'UTF-8');
        $pod_title   = esc_html($props['title']);
        $pod_link    = esc_url($props['link']);
        $pod_date    = esc_html($props['date']);
        $pod_summary = esc_html($props['summary']);

        $podcast_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
            . '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/>'
            . '<path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'
            . '</svg>';
        $pod_play_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
            . '<path d="M8 5v14l11-7z"/>'
            . '</svg>';

        $static_html = '<div class="vvp-co__podcast-banner">'
            .   '<div class="vvp-co__podcast-inner">'
            .     ($props['artworkUrl']
                    ? '<div class="vvp-co__podcast-artwork-wrap"><img src="' . esc_url($props['artworkUrl']) . '" alt="Podcast" class="vvp-co__podcast-artwork" loading="lazy" decoding="async"></div>'
                    : '')
            .     '<div class="vvp-co__podcast-content">'
            .       '<div class="vvp-co__podcast-label">'
            .         '<span class="vvp-co__badge vvp-co__badge--podcast">' . $podcast_icon . 'Podcast</span>'
            .       '</div>'
            .       '<a href="' . $pod_link . '" class="vvp-co__podcast-title" target="_blank" rel="noopener noreferrer">' . $pod_title . '</a>'
            .       ($props['summary'] ? '<p class="vvp-co__podcast-summary">' . $pod_summary . '</p>' : '')
            .       '<div class="vvp-co__podcast-footer">'
            .         '<span class="vvp-co__podcast-date">' . $pod_date . '</span>'
            .         ($props['enclosure']
                        ? '<button type="button" class="vvp-co__podcast-listen-btn">' . $pod_play_icon . 'Anhören</button>'
                        : '')
            .       '</div>'
            .     '</div>'
            .   '</div>'
            . '</div>';

        return '<div class="vvp-co-podcast-mount" data-podcast-props="' . $encoded . '">' . $static_html . '</div>';
    }
}
