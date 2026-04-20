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

        // Author archive pages: read the queried author directly — no post lookup.
        // is_author() covers standard WP + PublishPress-linked real users (/author/slug/).
        // is_tax('author') covers PublishPress guest-author taxonomy archives.
        if (is_author() || (function_exists('is_tax') && is_tax('author'))) {
            $authors_data = self::get_author_from_archive();
        } else {
            $post_id      = self::resolve_post_id($block);
            $authors_data = self::get_authors_data($post_id);
        }

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

    // ── Author-archive source ──────────────────────────────────────────────────

    /**
     * Get author data for the current author archive page.
     *
     * Reads directly from the queried object — no post lookup needed.
     * Handles two cases:
     *   - WP_User  → standard WP author archive, optionally enriched via PublishPress.
     *   - WP_Term  → PublishPress guest-author taxonomy archive (taxonomy = 'author').
     *
     * @return array<int, array{name:string, bio:string, avatarUrl:string, profileUrl:string}>
     */
    private static function get_author_from_archive(): array
    {
        $queried = get_queried_object();

        if ($queried instanceof \WP_User) {
            return [self::get_author_data_from_wp_user($queried)];
        }

        // PublishPress guest-author taxonomy term.
        if ($queried instanceof \WP_Term && $queried->taxonomy === 'author') {
            return [self::get_author_data_from_pp_term($queried)];
        }

        return [];
    }

    /**
     * Build author data from a WP_User.
     * Tries to enrich via PublishPress (custom avatar, richer bio) when available.
     *
     * @param \WP_User $user Queried WP user.
     * @return array{name:string, bio:string, avatarUrl:string, profileUrl:string}
     */
    private static function get_author_data_from_wp_user(\WP_User $user): array
    {
        // PublishPress Authors: try to get the linked author object for richer data.
        if (class_exists('\MA_Author')) {
            $pp_author = \MA_Author::get_by_user_id($user->ID);
            if ($pp_author && !is_wp_error($pp_author)) {
                return self::map_pp_author($pp_author);
            }
        }

        // Standard WP user meta fallback.
        return [
            'name'       => $user->display_name,
            'bio'        => self::format_bio((string) get_user_meta($user->ID, 'description', true)),
            'avatarUrl'  => get_avatar_url($user->user_email ?: $user->ID, ['size' => 150]),
            'profileUrl' => get_author_posts_url($user->ID),
        ];
    }

    /**
     * Build author data from a PublishPress Authors WP_Term (guest / custom author).
     *
     * @param \WP_Term $term Queried author term.
     * @return array{name:string, bio:string, avatarUrl:string, profileUrl:string}
     */
    private static function get_author_data_from_pp_term(\WP_Term $term): array
    {
        // PublishPress Authors: get the full author object from the term.
        if (class_exists('\MA_Author')) {
            $pp_author = \MA_Author::get_by_term_id($term->term_id);
            if ($pp_author && !is_wp_error($pp_author)) {
                return self::map_pp_author($pp_author);
            }
        }

        // Fallback: read directly from term meta.
        $user_id = (int) get_term_meta($term->term_id, 'user_id', true);
        $bio     = (string) (get_term_meta($term->term_id, 'description', true) ?: $term->description);
        $avatar  = (string) get_term_meta($term->term_id, 'ppma_avatar', true);

        if (empty($avatar) && $user_id > 0) {
            $avatar = get_avatar_url($user_id, ['size' => 150]);
        }

        $profile_url = '';
        try {
            $link = get_term_link($term);
            $profile_url = is_wp_error($link) ? '' : $link;
        } catch (\Throwable $e) {
            $profile_url = '';
        }

        return [
            'name'       => $term->name,
            'bio'        => self::format_bio($bio),
            'avatarUrl'  => $avatar,
            'profileUrl' => $profile_url,
        ];
    }

    // ── Post-based source (fallback for non-archive use) ──────────────────────

    /**
     * Resolve the post ID for the current render context.
     *
     * Only called when NOT on an author archive page. Mirrors Divi's own
     * PostTitle module pattern (get_queried_object_id → et_core_get_main_post_id → get_the_ID).
     *
     * @param object $block Current block object.
     * @return int Resolved post ID, or 0 if none found.
     */
    private static function resolve_post_id($block): int
    {
        // 1. Block context — populated when usesContext is declared and a loop provides it.
        if (!empty($block->context['postId'])) {
            return (int) $block->context['postId'];
        }

        // 2. Divi's ET_Post_Stack — tracks the WP query post through nested renders.
        if (function_exists('et_core_get_main_post_id')) {
            $divi_id = (int) et_core_get_main_post_id();
            if ($divi_id > 0) {
                return $divi_id;
            }
        }

        // 3. Bare global $post fallback.
        return (int) get_the_ID();
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
                'bio'        => self::format_bio(get_the_author_meta('description', $author_id)),
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
     * Convert a bio string (plain text or HTML) to safe HTML with <br> line breaks.
     *
     * @param string $bio Raw bio content (may be plain text or HTML).
     * @return string HTML containing only <br /> tags and entity-escaped text.
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
