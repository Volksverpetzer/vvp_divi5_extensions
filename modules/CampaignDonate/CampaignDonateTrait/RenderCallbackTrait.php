<?php
/**
 * CampaignDonate::render_callback()
 *
 * @package VVP\Divi5\CampaignDonate
 * @since 1.0.0
 */

namespace VVP\Divi5\CampaignDonate\CampaignDonateTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\CampaignDonate\CampaignDonate;

trait RenderCallbackTrait
{
    /**
     * CampaignDonate render callback for server-side rendering.
     *
     * Only emits the data attributes; the actual amount picker and Stripe
     * Embedded Checkout are mounted client-side (frontend.tsx), since taking
     * payment requires Stripe.js in the browser.
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
        $api_base_url      = rtrim(trim($attrs['apiBaseUrl']['desktop']['value'] ?? ''), '/');
        $campaign_key      = trim($attrs['campaignKey']['desktop']['value'] ?? '');
        $stripe_public_key = trim($attrs['stripePublicKey']['desktop']['value'] ?? '');
        $presets           = trim($attrs['presets']['desktop']['value'] ?? '') ?: '10,50,100';
        $certificate_url   = trim($attrs['certificateUrl']['desktop']['value'] ?? '');

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
            'classnamesFunction'  => [CampaignDonate::class, 'module_classnames'],
            'stylesComponent'     => [CampaignDonate::class, 'module_styles'],
            'scriptDataComponent' => [CampaignDonate::class, 'module_script_data'],
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
                    'attributes'        => [
                        'class'                => 'vvp-cd__mount',
                        'data-api-base'        => esc_attr($api_base_url),
                        'data-campaign-key'    => esc_attr($campaign_key),
                        'data-stripe-key'      => esc_attr($stripe_public_key),
                        'data-presets'         => esc_attr($presets),
                        'data-certificate-url' => esc_attr($certificate_url),
                    ],
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]),
            ],
        ]);
    }
}
