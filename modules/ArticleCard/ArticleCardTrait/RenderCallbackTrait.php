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
        $post = self::get_post_for_context();
        if (!$post) {
            return '';
        }

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
                ContentOverview::render_article_card($post),
            ],
        ]);
    }

    /**
     * The post this card represents: the current loop iteration's post when
     * rendered inside a Divi Loop, otherwise the page's own post.
     *
     * Only published posts of type "post" are rendered — the card's mapping
     * (Yoast description, reading time, category) only makes sense for
     * articles, and a template rendered on a page or other post type should
     * output nothing rather than a half-empty card.
     */
    private static function get_post_for_context(): ?\WP_Post
    {
        $post = get_post();

        if (!$post instanceof \WP_Post || 'post' !== $post->post_type || 'publish' !== $post->post_status) {
            return null;
        }

        return $post;
    }
}
