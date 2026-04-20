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

        $authors_data = self::get_authors_for_context();

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

    // ── Context-aware author resolution ───────────────────────────────────────

    /**
     * Resolve the author for the current author-archive request via get_queried_object().
     *
     * WordPress sets the queried object automatically for both standard author archives
     * (WP_User) and PublishPress guest-author archives (WP_Term, taxonomy 'author').
     *
     * @return array<int, array{name:string, bio:string, avatarUrl:string, profileUrl:string}>
     */
    private static function get_authors_for_context(): array
    {
        $queried = get_queried_object();

        if ($queried instanceof \WP_User) {
            return [self::get_author_data_from_wp_user($queried)];
        }

        if ($queried instanceof \WP_Term && $queried->taxonomy === 'author') {
            return [self::get_author_data_from_pp_term($queried)];
        }

        return [];
    }

    /**
     * Build author data from a WP_User.
     * Enriches with PublishPress data (custom avatar, richer bio) when available.
     *
     * @param \WP_User $user Queried WP user.
     * @return array{name:string, bio:string, avatarUrl:string, profileUrl:string}
     */
    private static function get_author_data_from_wp_user(\WP_User $user): array
    {
        $pp_class = self::pp_author_class();
        if ($pp_class) {
            $pp_author = $pp_class::get_by_user_id($user->ID);
            if ($pp_author && !is_wp_error($pp_author)) {
                return self::map_pp_author($pp_author);
            }
        }

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
        $pp_class = self::pp_author_class();
        if ($pp_class) {
            $pp_author = $pp_class::get_by_term_id($term->term_id);
            if ($pp_author && !is_wp_error($pp_author)) {
                return self::map_pp_author($pp_author);
            }
        }

        // Fallback: read directly from term meta (no PP class required).
        $user_id = (int) get_term_meta($term->term_id, 'user_id', true);
        $bio     = (string) (get_term_meta($term->term_id, 'description', true) ?: $term->description);
        $avatar  = (string) get_term_meta($term->term_id, 'ppma_avatar', true);

        if (empty($avatar) && $user_id > 0) {
            $avatar = get_avatar_url($user_id, ['size' => 150]);
        }

        $profile_url = '';
        try {
            $link        = get_term_link($term);
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

    // ── PublishPress helpers ──────────────────────────────────────────────────

    /**
     * Return the available PublishPress Author class name, or null if PP is absent.
     *
     * @return class-string|null
     */
    private static function pp_author_class(): ?string
    {
        static $cache = false;
        if ($cache !== false) {
            return $cache === '' ? null : $cache;
        }
        foreach ([
            'MultipleAuthors\\Classes\\Objects\\Author',
            'MA_Author',
        ] as $class) {
            if (class_exists($class)) {
                $cache = $class;
                return $class;
            }
        }
        $cache = '';
        return null;
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
     * @return string HTML with only <br /> tags and entity-escaped text.
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
