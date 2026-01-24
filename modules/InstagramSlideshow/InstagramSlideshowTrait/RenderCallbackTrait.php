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
        $post_id = $attrs['postId']['desktop']['value'] ?? '';
        $api_base_url = $attrs['apiBaseUrl']['desktop']['value'] ?? 'https://volksverpetzer-app.de/proxy/instaById/';
        $show_caption = $attrs['showCaption']['desktop']['value'] ?? 'on';
        $show_navigation = $attrs['showNavigation']['desktop']['value'] ?? 'on';
        $show_pagination = $attrs['showPagination']['desktop']['value'] ?? 'on';
        $autoplay = $attrs['autoplay']['desktop']['value'] ?? 'off';
        $transition_speed = $attrs['transitionSpeed']['desktop']['value'] ?? '3';

        // Fetch Instagram data.
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
            $slides_html .= HTMLUtility::render([
                'tag' => 'div',
                'attributes' => [
                    'class' => 'instagram-slideshow__slide' . $is_active,
                    'data-slide-index' => $index,
                ],
                'children' => HTMLUtility::render([
                    'tag' => 'img',
                    'attributes' => [
                        'src' => esc_url($image['media_url']),
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
        if ($show_caption === 'on' && !empty($instagram_data['caption'])) {
            $caption_html = HTMLUtility::render([
                'tag' => 'div',
                'attributes' => [
                    'class' => 'instagram-slideshow__caption',
                ],
                'childrenSanitizer' => 'wp_kses_post',
                'children' => $instagram_data['caption'],
            ]);
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
            ]) . $navigation_html . $pagination_html,
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
                    'children' => $slideshow_html . $caption_html,
                ]),
            ],
        ]);
    }
}
