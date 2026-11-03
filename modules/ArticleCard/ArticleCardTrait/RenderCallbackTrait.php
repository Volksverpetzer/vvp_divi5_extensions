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
use ET\Builder\Packages\Module\Options\Loop\LoopContext;
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
        $post = self::get_post_for_context($block);
        if (!$post) {
            return '';
        }

        // Fields declared with attrName "<name>.innerContent" in module.json
        // are stored under attrs.<name>.innerContent.<bp>.value — see PR #105.
        $hero = ($attrs['hero']['innerContent']['desktop']['value'] ?? 'off') === 'on';

        $parent       = BlockParserStore::get_parent($block->parsed_block['id'], $block->parsed_block['storeInstance']);
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
     * Inside an active Divi 5 Loop, the Loop's current item is the only
     * candidate. Divi does not switch the global post while rendering a
     * Loop, so the global (and the template's postId context) would be the
     * page, or on a single-post template an unrelated article that every
     * iteration would repeat. A Loop over terms, users or repeater rows
     * therefore renders nothing instead of falling back.
     *
     * Outside a Divi Loop, candidates in order, first match wins:
     *  1. The global post — what a loop that iterates with the_post() sets.
     *  2. The block's `postId` context (declared via usesContext in
     *     module.json) — for render paths that pass the loop item as context
     *     instead of switching the global.
     *
     * Only published posts of type "post" qualify. Besides limiting the card
     * to articles (its Yoast/reading-time/category mapping only makes sense
     * there), this also rejects the Theme Builder template's own post, which
     * is what the global resolves to inside a template outside a loop — see
     * RelatedItems::current_post_id(). Renders nothing rather than the wrong
     * post when no candidate qualifies.
     *
     * @param \WP_Block $block Block being rendered.
     */
    private static function get_post_for_context($block): ?\WP_Post
    {
        $loop_context = self::get_loop_context();
        if (null === $loop_context) {
            // A Loop is active, but its LoopContext API has changed.
            return null;
        }

        if ($loop_context) {
            $candidates = [self::get_loop_post($loop_context)];
        } else {
            $candidates = [get_post()];

            // Guard the ID: get_post(0) would fall back to the global again.
            $context_id = (int) ($block->context['postId'] ?? 0);
            if ($context_id > 0) {
                $candidates[] = get_post($context_id);
            }
        }

        foreach ($candidates as $post) {
            if ($post instanceof \WP_Post && 'post' === $post->post_type && 'publish' === $post->post_status) {
                return $post;
            }
        }

        return null;
    }

    /**
     * Divi 5's LoopContext for the enclosing Loop.
     *
     * Divi stores the Loop's query results and the current iteration in
     * LoopContext (Packages/Module/Options/Loop/LoopContext.php) instead of
     * calling setup_postdata(). This is Divi-internal API, so the three
     * possible outcomes are kept apart:
     *  - object: an active Loop with every method get_loop_post() needs.
     *  - false:  no active Loop — LoopContext::get() returned nothing, or
     *            LoopContext / its get() doesn't exist, so a Loop can't be
     *            detected at all (the behaviour before Divi's LoopContext).
     *  - null:   an active Loop whose context lacks a required method, i.e.
     *            Divi changed the API. The caller renders nothing rather
     *            than falling back to the global post, which would repeat an
     *            unrelated article in every iteration.
     *
     * @return object|false|null
     */
    private static function get_loop_context()
    {
        $class = LoopContext::class;
        // is_callable(), not method_exists(): a non-public or non-static
        // get() after a Divi update must not fatal.
        if (!class_exists($class) || !is_callable([$class, 'get'])) {
            return false;
        }

        $context = $class::get();
        if (!is_object($context)) {
            return false;
        }

        foreach (['get_query_type', 'get_current_iteration', 'get_result_for_position'] as $method) {
            if (!is_callable([$context, $method])) {
                return null;
            }
        }

        return $context;
    }

    /**
     * The current item of a Divi Loop, or null if the Loop isn't over posts
     * (terms, users, repeater rows) or the item can't be resolved.
     *
     * @param object $loop_context Value from get_loop_context().
     */
    private static function get_loop_post(object $loop_context): ?\WP_Post
    {
        if ('post_types' !== $loop_context->get_query_type()) {
            return null;
        }

        $result = $loop_context->get_result_for_position($loop_context->get_current_iteration());
        if ($result instanceof \WP_Post) {
            return $result;
        }

        // Results may also be plain objects carrying the post ID.
        $id = (int) (is_object($result) ? ($result->ID ?? $result->id ?? 0) : 0);

        return $id > 0 ? get_post($id) : null;
    }
}
