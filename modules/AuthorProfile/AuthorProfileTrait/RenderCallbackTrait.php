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
     * @param array          $attrs
     * @param string         $content
     * @param WP_Block       $block
     * @param ModuleElements $elements
     * @return string
     */
    public static function render_callback($attrs, $content, $block, $elements)
    {
        $show_avatar = ($attrs['showAvatar']['desktop']['value'] ?? 'on') !== 'off';
        $show_bio    = ($attrs['showBio']['desktop']['value'] ?? 'on') !== 'off';
        $show_link   = ($attrs['showLink']['desktop']['value'] ?? 'on') !== 'off';
        $layout      = $attrs['layout']['desktop']['value'] ?? 'vertical';
        $avatar_size = max(16, (int) preg_replace('/[^0-9]/', '', $attrs['avatarSize']['desktop']['value'] ?? '80') ?: 80);

        $authors_data = self::get_authors_for_context();

        $parent       = BlockParserStore::get_parent($block->parsed_block['id'], $block->parsed_block['storeInstance']);
        $parent_attrs = $parent->attrs ?? [];

        $mount_attrs = [
            'class'            => 'vvp-ap__mount',
            'data-authors'     => esc_attr(wp_json_encode($authors_data)),
            'data-show-avatar' => $show_avatar ? 'true' : 'false',
            'data-show-bio'    => $show_bio ? 'true' : 'false',
            'data-show-link'   => $show_link ? 'true' : 'false',
            'data-layout'      => esc_attr($layout),
            'data-avatar-size' => (string) $avatar_size,
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
     * @return array<int, array{name:string, bio:string, avatarUrl:string, profileUrl:string}>
     */
    private static function get_authors_for_context(): array
    {
        $author = function_exists('get_archive_author') ? get_archive_author() : false;

        return $author !== false ? [self::map_pp_author($author)] : [];
    }

    /**
     * @param object $author PublishPress Author object.
     * @return array{name:string, bio:string, avatarUrl:string, profileUrl:string}
     */
    private static function map_pp_author(object $author): array
    {
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
            'bio'        => self::format_bio($author->description ?? ''),
            'avatarUrl'  => $avatar_url,
            'profileUrl' => $profile_url,
        ];
    }

    /**
     * @param string $bio Raw bio (plain text or HTML).
     * @return string Safe HTML with <br /> line breaks.
     */
    private static function format_bio(string $bio): string
    {
        $bio = preg_replace('/<\/(p|div|blockquote|li)>/i', "\n", $bio);
        $bio = preg_replace('/<br\s*\/?>/i', "\n", $bio);
        $bio = wp_strip_all_tags($bio);
        $bio = trim(preg_replace('/\n{2,}/', "\n", $bio));
        return nl2br(esc_html($bio));
    }
}
