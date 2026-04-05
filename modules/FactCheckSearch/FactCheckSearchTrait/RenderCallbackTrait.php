<?php
/**
 * FactCheckSearch::render_callback()
 *
 * @package VVP\FactCheckSearch\FactCheckSearch
 * @since 1.0.0
 */

namespace VVP\FactCheckSearch\FactCheckSearch\FactCheckSearchTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\FactCheckSearch\FactCheckSearch\FactCheckSearch;

trait RenderCallbackTrait
{
    /**
     * FactCheckSearch render callback for server-side rendering.
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
        $search_api_url = $attrs['searchApiUrl']['desktop']['value'] ?? '';
        $import_api_url = $attrs['importApiUrl']['desktop']['value'] ?? '';

        if ( '' === $search_api_url ) {
            $search_api_url = 'https://ai.volksverpetzer-app.de/api/vector-search/';
        }
        if ( '' === $import_api_url ) {
            $import_api_url = 'https://ai.volksverpetzer-app.de/api/import-url/';
        }

        $parent       = BlockParserStore::get_parent($block->parsed_block['id'], $block->parsed_block['storeInstance']);
        $parent_attrs = $parent->attrs ?? [];

        return Module::render([
            'orderIndex'         => $block->parsed_block['orderIndex'],
            'storeInstance'      => $block->parsed_block['storeInstance'],
            'attrs'              => $attrs,
            'elements'           => $elements,
            'id'                 => $block->parsed_block['id'],
            'name'               => $block->block_type->name,
            'moduleCategory'     => $block->block_type->category,
            'classnamesFunction' => [FactCheckSearch::class, 'module_classnames'],
            'stylesComponent'    => [FactCheckSearch::class, 'module_styles'],
            'scriptDataComponent'=> [FactCheckSearch::class, 'module_script_data'],
            'parentAttrs'        => $parent_attrs,
            'parentId'           => $parent->id ?? '',
            'parentName'         => $parent->blockName ?? '',
            'children'           => [
                ElementComponents::component([
                    'attrs'         => $attrs['module']['decoration'] ?? [],
                    'id'            => $block->parsed_block['id'],
                    'orderIndex'    => $block->parsed_block['orderIndex'],
                    'storeInstance' => $block->parsed_block['storeInstance'],
                ]),
                HTMLUtility::render([
                    'tag'               => 'div',
                    'attributes'        => [
                        'class'           => 'vvp-fc__mount',
                        'data-search-url' => esc_attr($search_api_url),
                        'data-import-url' => esc_attr($import_api_url),
                    ],
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]),
            ],
        ]);
    }
}
