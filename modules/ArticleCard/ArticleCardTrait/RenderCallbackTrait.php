<?php
/**
 * ArticleCard::render_callback()
 *
 * @package VVP\Divi5\ArticleCard
 * @since 1.6.0
 */

namespace VVP\Divi5\ArticleCard\ArticleCardTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\ArticleCard\ArticleCard;
use VVP\Divi5\ContentOverview\ContentOverview;

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
        $parent = BlockParserStore::get_parent($block->parsed_block['id'], $block->parsed_block['storeInstance']);

        $post = self::get_post_for_context($attrs, $block, $parent);
        if (!$post) {
            return '';
        }

        // Fields declared with attrName "<name>.innerContent" in module.json
        // are stored under attrs.<name>.innerContent.<bp>.value — see PR #105.
        $hero = ($attrs['hero']['innerContent']['desktop']['value'] ?? 'off') === 'on';

        $parent_attrs = $parent->attrs ?? [];

        return Module::render([
            'orderIndex'          => $block->parsed_block['orderIndex'],
            'storeInstance'       => $block->parsed_block['storeInstance'],
            'attrs'               => $attrs,
            'elements'            => $elements,
            'id'                  => $block->parsed_block['id'],
            'name'                => $block->block_type->name,
            'moduleCategory'      => $block->block_type->category,
            'classnamesFunction'  => [ArticleCard::class, 'module_classnames'],
            'stylesComponent'     => [ArticleCard::class, 'module_styles'],
            'scriptDataComponent' => [ArticleCard::class, 'module_script_data'],
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
                ContentOverview::render_article_card($post, $hero),
            ],
        ]);
    }

    /**
     * The post this card represents: the current loop iteration's post when
     * rendered inside a Divi Loop, otherwise the page's own post.
     *
     * Inside a Divi 5 Loop, the Loop item's post ID is the only candidate.
     * Divi neither switches the global post while rendering a Loop nor keeps
     * its LoopContext around for rendering (it is set while the Loop's
     * blocks are duplicated and cleared before they render), so the global
     * would be the page, or on a single-post template an unrelated article
     * that every iteration would repeat.
     *
     * Outside a Divi Loop, candidates in order, first match wins:
     *  1. The global post — what a loop that iterates with the_post() sets.
     *  2. The block's `postId` context (declared via usesContext in
     *     module.json) — for render paths that pass the loop item as context
     *     instead of switching the global.
     *
     * Only published posts of type "post" qualify (see
     * ContentOverview::is_card_post()). Besides limiting the card to
     * articles, this also rejects the Theme Builder template's own post, which
     * is what the global resolves to inside a template outside a loop — see
     * RelatedItems::current_post_id(). Renders nothing rather than the wrong
     * post when no candidate qualifies.
     *
     * @param array       $attrs  Module attributes.
     * @param \WP_Block   $block  Block being rendered.
     * @param object|null $parent The block's parent (BlockParserStore::get_parent()).
     */
    private static function get_post_for_context(array $attrs, $block, $parent): ?\WP_Post
    {
        $loop_post_id = self::get_loop_post_id($attrs, $parent, $block->parsed_block['storeInstance'] ?? null);
        if (null !== $loop_post_id) {
            $candidates = [$loop_post_id > 0 ? get_post($loop_post_id) : null];
        } else {
            $candidates = [get_post()];

            // Guard the ID: get_post(0) would fall back to the global again.
            $context_id = (int) ($block->context['postId'] ?? 0);
            if ($context_id > 0) {
                $candidates[] = get_post($context_id);
            }
        }

        foreach ($candidates as $post) {
            if (ContentOverview::is_card_post($post)) {
                return $post;
            }
        }

        return null;
    }

    /**
     * Post ID of the enclosing Divi Loop item, 0 inside a Loop item without
     * one, or null outside a Divi Loop.
     *
     * When Divi duplicates a Loop's block once per query result
     * (LoopUtils, the foreach around LoopContext::set_position_context()),
     * it stamps each copy with `__loop_source_id` and — for results that
     * resolve to a post — `__loop_post_id`, explicitly "for later use during
     * rendering". The Loop is enabled on a container (row, column, group),
     * so those attrs sit on an ancestor of this module, not on the module
     * itself: walk up to the nearest block carrying them.
     *
     * Read via isset() on plain arrays only — these are Divi-internal attrs,
     * and if Divi stops writing them the card falls back to the non-Loop
     * candidates instead of fataling.
     *
     * @param array       $attrs  Module attributes.
     * @param object|null $parent The module's parent block.
     * @param mixed       $store  The block parser store instance.
     */
    private static function get_loop_post_id(array $attrs, $parent, $store): ?int
    {
        $loop_attrs = $attrs;

        // Bounded walk: Divi nests section > row > column > (group…) > module.
        for ($depth = 0; $depth < 20; $depth++) {
            if (isset($loop_attrs['__loop_post_id'])) {
                return max(0, (int) $loop_attrs['__loop_post_id']);
            }
            if (isset($loop_attrs['__loop_source_id'])) {
                // A Loop item whose result isn't a post (term, user, …).
                return 0;
            }

            if (!is_object($parent) || !isset($parent->id)) {
                break;
            }
            $loop_attrs = is_array($parent->attrs ?? null) ? $parent->attrs : [];
            $parent     = null === $store ? null : BlockParserStore::get_parent($parent->id, $store);
        }

        return null;
    }
}
