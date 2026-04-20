<?php
/**
 * AuthorProfile::render_callback()
 *
 * @package VVP\FactCheckSearch\AuthorProfile
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\AuthorProfile\AuthorProfileTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\FactCheckSearch\AuthorProfile\AuthorProfile;

trait RenderCallbackTrait
{
    /**
     * AuthorProfile render callback for server-side rendering.
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
        $show_avatar = ($attrs['showAvatar']['desktop']['value'] ?? 'on') !== 'off';
        $show_bio    = ($attrs['showBio']['desktop']['value'] ?? 'on') !== 'off';
        $show_link   = ($attrs['showLink']['desktop']['value'] ?? 'on') !== 'off';
        $layout      = $attrs['layout']['desktop']['value'] ?? 'vertical';
        $avatar_size = max(16, (int) preg_replace('/[^0-9]/', '', $attrs['avatarSize']['desktop']['value'] ?? '80') ?: 80);

        $post_id = isset($block->context['postId'])
            ? (int) $block->context['postId']
            : get_the_ID();

        $authors_data = self::get_authors_data($post_id);

        $parent       = BlockParserStore::get_parent($block->parsed_block['id'], $block->parsed_block['storeInstance']);
        $parent_attrs = $parent->attrs ?? [];

        $mount_attrs = [
            'class'             => 'vvp-ap__mount',
            'data-authors'      => esc_attr(wp_json_encode($authors_data)),
            'data-show-avatar'  => $show_avatar ? 'true' : 'false',
            'data-show-bio'     => $show_bio ? 'true' : 'false',
            'data-show-link'    => $show_link ? 'true' : 'false',
            'data-layout'       => esc_attr($layout),
            'data-avatar-size'  => (string) $avatar_size,
        ];

        return Module::render([
            'orderIndex'          => $block->parsed_block['orderIndex'],
            'storeInstance'       => $block->parsed_block['storeInstance'],
            'attrs'               => $attrs,
            'elements'            => $elements,
            'id'                  => $block->parsed_block['id'],
            'name'                => $block->block_type->name,
            'moduleCategory'      => $block->block_type->category,
            'classnamesFunction'  => [AuthorProfile::class, 'module_classnames'],
            'stylesComponent'     => [AuthorProfile::class, 'module_styles'],
            'scriptDataComponent' => [AuthorProfile::class, 'module_script_data'],
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
                HTMLUtility::render([
                    'tag'               => 'div',
                    'attributes'        => $mount_attrs,
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]),
            ],
        ]);
    }

    /**
     * Collect author data for a post, preferring PublishPress Authors if available.
     *
     * @param int $post_id Post ID.
     * @return array<int, array{name:string, bio:string, avatarUrl:string, profileUrl:string}>
     */
    private static function get_authors_data(int $post_id): array
    {
        if ($post_id <= 0) {
            return [];
        }

        // PublishPress Authors path.
        if (function_exists('get_post_authors')) {
            $pp_authors = get_post_authors($post_id);
            if (!empty($pp_authors)) {
                return array_values(array_map([self::class, 'map_pp_author'], $pp_authors));
            }
        }

        // Standard WP fallback.
        $author_id = (int) get_post_field('post_author', $post_id);
        if ($author_id <= 0) {
            return [];
        }

        return [
            [
                'name'       => get_the_author_meta('display_name', $author_id),
                'bio'        => get_the_author_meta('description', $author_id),
                'avatarUrl'  => get_avatar_url($author_id, ['size' => 150]),
                'profileUrl' => get_author_posts_url($author_id),
            ],
        ];
    }

    /**
     * Map a PublishPress Author object to a plain data array.
     *
     * @param object $author PublishPress Author object.
     * @return array{name:string, bio:string, avatarUrl:string, profileUrl:string}
     */
    private static function map_pp_author(object $author): array
    {
        // Resolve avatar URL: prefer explicitly uploaded PublishPress avatar.
        $avatar_url = '';
        if (!empty($author->avatar) && filter_var($author->avatar, FILTER_VALIDATE_URL)) {
            $avatar_url = $author->avatar;
        } elseif (!empty($author->user_email)) {
            $avatar_url = get_avatar_url($author->user_email, ['size' => 150]);
        } elseif (!empty($author->ID)) {
            $avatar_url = get_avatar_url($author->ID, ['size' => 150]);
        }

        $profile_url = '';
        if (!empty($author->link)) {
            $profile_url = $author->link;
        } elseif (!empty($author->ID)) {
            $profile_url = get_author_posts_url($author->ID);
        }

        return [
            'name'       => $author->display_name ?? '',
            'bio'        => wp_strip_all_tags($author->description ?? ''),
            'avatarUrl'  => $avatar_url,
            'profileUrl' => $profile_url,
        ];
    }
}
