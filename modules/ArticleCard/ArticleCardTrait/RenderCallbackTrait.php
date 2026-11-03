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
     * Candidates, first match wins:
     *  1. Divi 5's LoopContext — the current item of the enclosing Divi
     *     Loop. Divi does not switch the global post while rendering a Loop,
     *     so this is the only place the loop item is available. Checked
     *     first: on a single-post template the global is a valid article
     *     too, but not the one the Loop iteration is about.
     *  2. The global post — what a loop that iterates with the_post() sets.
     *  3. The block's `postId` context (declared via usesContext in
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
        $candidates = [self::get_loop_post(), get_post()];

        // Guard the ID: get_post(0) would fall back to the global again.
        $context_id = (int) ($block->context['postId'] ?? 0);
        if ($context_id > 0) {
            $candidates[] = get_post($context_id);
        }

        foreach ($candidates as $post) {
            if ($post instanceof \WP_Post && 'post' === $post->post_type && 'publish' === $post->post_status) {
                return $post;
            }
        }

        return null;
    }

    /**
     * The current item of the enclosing Divi 5 Loop, or null outside a Loop
     * or for Loops over something other than posts (terms, users, repeater
     * rows).
     *
     * Divi stores the Loop's query results and the current iteration in
     * LoopContext (Packages/Module/Options/Loop/LoopContext.php) instead of
     * calling setup_postdata(). Guarded with method_exists() since this is
     * Divi-internal API.
     */
    private static function get_loop_post(): ?\WP_Post
    {
        $loop_context = LoopContext::class;
        if (!class_exists($loop_context) || !method_exists($loop_context, 'get')) {
            return null;
        }

        $context = $loop_context::get();
        if (!$context
            || !method_exists($context, 'get_result_for_position')
            || !method_exists($context, 'get_current_iteration')
            || (method_exists($context, 'get_query_type') && 'post_types' !== $context->get_query_type())
        ) {
            return null;
        }

        $result = $context->get_result_for_position($context->get_current_iteration());
        if ($result instanceof \WP_Post) {
            return $result;
        }

        // Results may also be plain objects carrying the post ID.
        $id = (int) (is_object($result) ? ($result->ID ?? $result->id ?? 0) : 0);

        return $id > 0 ? get_post($id) : null;
    }
}
