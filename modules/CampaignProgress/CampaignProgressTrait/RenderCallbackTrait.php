<?php
/**
 * CampaignProgress::render_callback()
 *
 * @package VVP\Divi5\CampaignProgress
 * @since 1.0.0
 */

namespace VVP\Divi5\CampaignProgress\CampaignProgressTrait;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use VVP\Divi5\CampaignProgress\CampaignProgress;

trait RenderCallbackTrait
{
    /**
     * CampaignProgress render callback for server-side rendering.
     *
     * Fetches the campaign summary server-side (short-TTL cached) so the bar
     * paints with a real value before the frontend JS takes over polling —
     * mirrors ContentOverview's DataFetchTrait caching approach.
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
        // Text/select fields declared with attrName "<name>.innerContent" in
        // module.json are actually stored under attrs.<name>.innerContent.<bp>.value
        // — attrs.<name>.desktop.value is a separate, unused shadow default.
        // Confirmed against the raw saved block markup; the shallow path (no
        // .innerContent) silently always read the empty/placeholder default.
        $summary_api_url = trim($attrs['summaryApiUrl']['innerContent']['desktop']['value'] ?? '');
        $goal_input      = trim($attrs['goal']['innerContent']['desktop']['value'] ?? '');

        // A goal explicitly configured in the Divi module always takes
        // precedence over whatever the campaign API reports — the API's
        // goal is only used as a fallback when the module's own field is
        // left empty.
        $divi_goal = is_numeric($goal_input) && (float) $goal_input > 0 ? (float) $goal_input : null;

        $summary        = self::fetch_summary($summary_api_url);
        $initial_total  = $summary['totalRaised'] ?? 0;
        $initial_goal   = $divi_goal ?? $summary['goal'] ?? 100000;

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
            'classnamesFunction'  => [CampaignProgress::class, 'module_classnames'],
            'stylesComponent'     => [CampaignProgress::class, 'module_styles'],
            'scriptDataComponent' => [CampaignProgress::class, 'module_script_data'],
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
                        'class'              => 'vvp-cp__mount',
                        'data-summary-url'   => esc_attr($summary_api_url),
                        'data-goal-override' => esc_attr(null !== $divi_goal ? (string) $divi_goal : ''),
                        'data-initial-total' => esc_attr((string) $initial_total),
                        'data-initial-goal'  => esc_attr((string) $initial_goal),
                    ],
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]),
            ],
        ]);
    }

    /**
     * Fetch { totalRaised, goal } from the campaign summary API, cached for
     * 60s (matches the old crowdfunding app's own Cache-Control: s-maxage=60).
     * Stampede-safe: only the transient's expiring holder refetches; everyone
     * else serves the last good value.
     *
     * @param string $url Summary API URL. Empty string short-circuits to defaults.
     *
     * @return array{totalRaised: float, goal: float|null}
     */
    private static function fetch_summary(string $url): array
    {
        $default = ['totalRaised' => 0, 'goal' => null];

        if ('' === $url || false === filter_var($url, FILTER_VALIDATE_URL)) {
            return $default;
        }

        $cache_key = 'vvp_cp_summary_' . md5($url);
        $cached    = get_transient($cache_key);
        if (false !== $cached) {
            return $cached;
        }

        $lock_key = $cache_key . '_lock';
        if (false !== get_transient($lock_key)) {
            return $default;
        }
        set_transient($lock_key, 1, 15);

        $result   = $default;
        $response = wp_remote_get($url, [
            'timeout'    => 3,
            'user-agent' => 'VVP-CampaignProgress/1.0',
        ]);

        if (!is_wp_error($response) && 200 === (int) wp_remote_retrieve_response_code($response)) {
            $data = json_decode(wp_remote_retrieve_body($response), true);
            if (is_array($data)) {
                $result = [
                    'totalRaised' => is_numeric($data['totalRaised'] ?? null) ? (float) $data['totalRaised'] : 0,
                    // Must match the > 0 check used for $divi_goal above and
                    // the frontend's polling guard (data.goal > 0) — a 0 or
                    // negative API goal here would otherwise slip through
                    // the ?? fallback chain (PHP's ?? only skips null, not
                    // 0) and neither side would ever correct it afterwards.
                    'goal'        => is_numeric($data['goal'] ?? null) && (float) $data['goal'] > 0
                        ? (float) $data['goal']
                        : null,
                ];
                set_transient($cache_key, $result, 60);
            }
        }

        delete_transient($lock_key);

        return $result;
    }
}
