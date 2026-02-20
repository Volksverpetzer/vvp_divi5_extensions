<?php
/**
 * InstagramSlideshow::render_callback()
 *
 * @package VVP\InstagramSlideshow\InstagramSlideshow
 * @since 1.0.0
 */

namespace VVP\InstagramSlideshow\InstagramSlideshow\InstagramSlideshowTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\InstagramSlideshow\InstagramSlideshow\InstagramSlideshow;

trait RenderCallbackTrait
{

    /**
     * Fetch Instagram data from API.
     *
     * @since 1.0.0
     *
     * @param string $post_id Instagram post ID.
     * @param string $api_base_url Base URL for Instagram API.
     *
     * @return array|WP_Error Instagram data or error.
     */
    private static function fetch_instagram_data($post_id, $api_base_url)
    {
        if (empty($post_id)) {
            return new \WP_Error('empty_post_id', __('Instagram Post ID is required.', 'instagram-slideshow-extension'));
        }

        $api_url = trailingslashit($api_base_url) . $post_id;
        $response = wp_remote_get($api_url, [
            'timeout' => 15,
            'sslverify' => true,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (empty($data) || !is_array($data)) {
            return new \WP_Error('invalid_response', __('Invalid Instagram API response.', 'instagram-slideshow-extension'));
        }

        return $data;
    }

    /**
     * Fetch Instagram feed data.
     *
     * @since 1.0.0
     *
     * @param string $feed_url Feed endpoint URL.
     *
     * @return array|WP_Error Feed data or error.
     */
    private static function fetch_instagram_feed($feed_url)
    {
        $response = wp_remote_get($feed_url, [
            'timeout' => 15,
            'sslverify' => true,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (empty($data) || !is_array($data) || empty($data['data']) || !is_array($data['data'])) {
            return new \WP_Error('invalid_feed_response', __('Invalid Instagram feed response.', 'instagram-slideshow-extension'));
        }

        return $data;
    }

    /**
     * Convert URLs in text to clickable links.
     *
     * @since 1.0.0
     *
     * @param string $text Input text.
     *
     * @return string Linkified HTML.
     */
    private static function linkify($text)
    {
        return preg_replace(
            '/(https?:\/\/[^\s]+)/',
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
            $text
        );
    }

    /**
     * Instagram Slideshow module render callback for server-side rendering.
     *
     * @since 1.0.0
     *
     * @param array          $attrs    Block attributes saved by Visual Builder.
     * @param string         $content  Block content.
     * @param WP_Block       $block    Parsed block object being rendered.
     * @param ModuleElements $elements ModuleElements instance.
     *
     * @return string HTML rendered output of Instagram Slideshow module.
     */
    public static function render_callback($attrs, $content, $block, $elements)
    {
        // Get module settings.
        $use_latest = $attrs['useLatest']['desktop']['value'] ?? 'off';
        $latest_index = (int) ($attrs['latestIndex']['desktop']['value'] ?? 1);
        $post_id = $attrs['postId']['desktop']['value'] ?? '';
        $api_base_url = $attrs['apiBaseUrl']['desktop']['value'] ?? 'https://volksverpetzer-app.de/proxy/instaById/';
        $feed_url = 'https://volksverpetzer-app.de/proxy/instaFeed';
        $show_caption = $attrs['showCaption']['desktop']['value'] ?? 'on';
        $show_navigation = $attrs['showNavigation']['desktop']['value'] ?? 'on';
        $show_pagination = $attrs['showPagination']['desktop']['value'] ?? 'on';
        $autoplay = $attrs['autoplay']['desktop']['value'] ?? 'off';
        $transition_speed = $attrs['transitionSpeed']['desktop']['value'] ?? '3';

        // Fetch Instagram data.
        if ($use_latest === 'on') {
            if ($latest_index < 1) {
                $latest_index = 1;
            }
            $feed_data = self::fetch_instagram_feed($feed_url);
            if (is_wp_error($feed_data)) {
                return HTMLUtility::render([
                    'tag' => 'div',
                    'attributes' => [
                        'class' => 'instagram-slideshow__error',
                    ],
                    'childrenSanitizer' => 'esc_html',
                    'children' => sprintf(
                        __('Error loading Instagram feed: %s', 'instagram-slideshow-extension'),
                        $feed_data->get_error_message()
                    ),
                ]);
            }

            $items = $feed_data['data'];
            if (empty($items[$latest_index - 1]['id'])) {
                return HTMLUtility::render([
                    'tag' => 'div',
                    'attributes' => [
                        'class' => 'instagram-slideshow__error',
                    ],
                    'childrenSanitizer' => 'esc_html',
                    'children' => __('Latest index is out of range.', 'instagram-slideshow-extension'),
                ]);
            }

            $post_id = $items[$latest_index - 1]['id'];
        }

        $instagram_data = self::fetch_instagram_data($post_id, $api_base_url);

        if (is_wp_error($instagram_data)) {
            return HTMLUtility::render([
                'tag' => 'div',
                'attributes' => [
                    'class' => 'instagram-slideshow__error',
                ],
                'childrenSanitizer' => 'esc_html',
                'children' => sprintf(
                    __('Error loading Instagram post: %s', 'instagram-slideshow-extension'),
                    $instagram_data->get_error_message()
                ),
            ]);
        }

        // Extract images from carousel.
        $images = [];
        if (isset($instagram_data['children']['data']) && is_array($instagram_data['children']['data'])) {
            $images = $instagram_data['children']['data'];
        } elseif (isset($instagram_data['media_url'])) {
            // Single image post.
            $images = [
                [
                    'media_url' => $instagram_data['media_url'],
                    'id' => $instagram_data['id'] ?? '',
                ]
            ];
        }

        if (empty($images)) {
            return HTMLUtility::render([
                'tag' => 'div',
                'attributes' => [
                    'class' => 'instagram-slideshow__error',
                ],
                'childrenSanitizer' => 'esc_html',
                'children' => __('No images found in Instagram post.', 'instagram-slideshow-extension'),
            ]);
        }

        // Build slideshow slides HTML.
        $slides_html = '';
        foreach ($images as $index => $image) {
            $is_active = $index === 0 ? ' active' : '';
            $should_load = $index === 0 || $index === 1 || count( $images ) === 1;
            $placeholder_src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";
            $img_src = $should_load ? esc_url($image['media_url']) : $placeholder_src;
            $slides_html .= HTMLUtility::render([
                'tag' => 'div',
                'attributes' => [
                    'class' => 'instagram-slideshow__slide' . $is_active,
                    'data-slide-index' => $index,
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children' => HTMLUtility::render([
                    'tag' => 'img',
                    'attributes' => [
                        'src' => $img_src,
                        'data-src' => esc_url($image['media_url']),
                        'alt' => sprintf(__('Instagram image %d', 'instagram-slideshow-extension'), $index + 1),
                        'loading' => $index === 0 ? 'eager' : 'lazy',
                    ],
                ]),
            ]);
        }

        // Navigation arrows.
        $navigation_html = '';
        if ($show_navigation === 'on') {
            $navigation_html = HTMLUtility::render([
                'tag' => 'button',
                'attributes' => [
                    'class' => 'instagram-slideshow__nav instagram-slideshow__nav--prev',
                    'aria-label' => __('Previous slide', 'instagram-slideshow-extension'),
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children' => '‹',
            ]) . HTMLUtility::render([
                            'tag' => 'button',
                            'attributes' => [
                                'class' => 'instagram-slideshow__nav instagram-slideshow__nav--next',
                                'aria-label' => __('Next slide', 'instagram-slideshow-extension'),
                            ],
                            'childrenSanitizer' => 'et_core_esc_previously',
                            'children' => '›',
                        ]);
        }

        // Pagination dots.
        $pagination_html = '';
        if ($show_pagination === 'on') {
            $dots_html = '';
            foreach ($images as $index => $image) {
                $is_active = $index === 0 ? ' active' : '';
                $dots_html .= HTMLUtility::render([
                    'tag' => 'button',
                    'attributes' => [
                        'class' => 'instagram-slideshow__dot' . $is_active,
                        'data-slide-index' => $index,
                        'aria-label' => sprintf(__('Go to slide %d', 'instagram-slideshow-extension'), $index + 1),
                    ],
                ]);
            }
            $pagination_html = HTMLUtility::render([
                'tag' => 'div',
                'attributes' => [
                    'class' => 'instagram-slideshow__pagination',
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children' => $dots_html,
            ]);
        }

        // Caption.
        $caption_html = '';
        $overlay_html = '';
        $caption = $instagram_data['caption'] ?? '';
        if ($show_caption === 'on' && !empty($caption)) {
            $is_long_caption = mb_strlen($caption) > 200;
            $truncated_caption = $is_long_caption ? mb_substr($caption, 0, 200) . '... ' : $caption;

            $read_more_html = $is_long_caption ? HTMLUtility::render([
                'tag' => 'button',
                'attributes' => [
                    'class' => 'instagram-slideshow__read-more',
                    'type' => 'button',
                ],
                'childrenSanitizer' => 'esc_html',
                'children' => __('Read More', 'instagram-slideshow-extension'),
            ]) : '';

            $caption_html = HTMLUtility::render([
                'tag' => 'div',
                'attributes' => [
                    'class' => 'instagram-slideshow__caption',
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children' => self::linkify(esc_html($truncated_caption)) . $read_more_html,
            ]);

            if ($is_long_caption) {
                $overlay_html = HTMLUtility::render([
                    'tag' => 'div',
                    'attributes' => [
                        'class' => 'instagram-slideshow__overlay',
                        'style' => 'display: none;',
                    ],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children' => HTMLUtility::render([
                        'tag' => 'div',
                        'attributes' => [
                            'class' => 'instagram-slideshow__overlay-content',
                        ],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children' => HTMLUtility::render([
                            'tag' => 'button',
                            'attributes' => [
                                'class' => 'instagram-slideshow__overlay-close',
                                'type' => 'button',
                                'aria-label' => __('Close', 'instagram-slideshow-extension'),
                            ],
                            'childrenSanitizer' => 'et_core_esc_previously',
                            'children' => '×',
                        ]) . HTMLUtility::render([
                            'tag' => 'div',
                            'attributes' => [
                                'class' => 'instagram-slideshow__overlay-body',
                            ],
                            'childrenSanitizer' => 'et_core_esc_previously',
                            'children' => self::linkify(esc_html($caption)),
                        ]),
                    ]),
                ]);
            }
        }

        // Slideshow container.
        $slideshow_html = HTMLUtility::render([
            'tag' => 'div',
            'attributes' => [
                'class' => 'instagram-slideshow__container',
            ],
            'childrenSanitizer' => 'et_core_esc_previously',
            'children' => HTMLUtility::render([
                'tag' => 'div',
                'attributes' => [
                    'class' => 'instagram-slideshow__slides',
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children' => $slides_html,
            ]) . $navigation_html,
        ]);

        // Get parent for context.
        $parent = BlockParserStore::get_parent($block->parsed_block['id'], $block->parsed_block['storeInstance']);
        $parent_attrs = $parent->attrs ?? [];

        return Module::render([
            // Frontend only.
            'orderIndex' => $block->parsed_block['orderIndex'],
            'storeInstance' => $block->parsed_block['storeInstance'],

            // Visual Builder equivalent.
            'attrs' => $attrs,
            'elements' => $elements,
            'id' => $block->parsed_block['id'],
            'name' => $block->block_type->name,
            'moduleCategory' => $block->block_type->category,
            'classnamesFunction' => [InstagramSlideshow::class, 'module_classnames'],
            'stylesComponent' => [InstagramSlideshow::class, 'module_styles'],
            'scriptDataComponent' => [InstagramSlideshow::class, 'module_script_data'],
            'parentAttrs' => $parent_attrs,
            'parentId' => $parent->id ?? '',
            'parentName' => $parent->blockName ?? '',
            'children' => [
                ElementComponents::component([
                    'attrs' => $attrs['module']['decoration'] ?? [],
                    'id' => $block->parsed_block['id'],
                    'orderIndex' => $block->parsed_block['orderIndex'],
                    'storeInstance' => $block->parsed_block['storeInstance'],
                ]),
                HTMLUtility::render([
                    'tag' => 'div',
                    'attributes' => [
                        'class' => 'instagram-slideshow__inner',
                        'data-autoplay' => $autoplay,
                        'data-transition-speed' => $transition_speed,
                    ],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children' => $slideshow_html . $pagination_html . $caption_html . $overlay_html,
                ]),
            ],
        ]);
    }
}
