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
     * Return an inline SVG string by icon name.
     *
     * @param string $name Icon identifier.
     * @param int    $size Icon width/height in pixels.
     *
     * @return string SVG markup.
     */
    private static function get_icon($name, $size = 18)
    {
        $s = (int) $size;
        $icons = [
            'search'        => "<svg xmlns='http://www.w3.org/2000/svg' width='{$s}' height='{$s}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>",
            'x'             => "<svg xmlns='http://www.w3.org/2000/svg' width='{$s}' height='{$s}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>",
            'shield-check'  => "<svg xmlns='http://www.w3.org/2000/svg' width='{$s}' height='{$s}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/><polyline points='9 12 11 14 15 10'/></svg>",
            'link'          => "<svg xmlns='http://www.w3.org/2000/svg' width='{$s}' height='{$s}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/><path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/></svg>",
            'file-text'     => "<svg xmlns='http://www.w3.org/2000/svg' width='{$s}' height='{$s}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/></svg>",
            'trending-up'   => "<svg xmlns='http://www.w3.org/2000/svg' width='{$s}' height='{$s}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><polyline points='22 7 13.5 15.5 8.5 10.5 2 17'/><polyline points='16 7 22 7 22 13'/></svg>",
            'alert-circle'  => "<svg xmlns='http://www.w3.org/2000/svg' width='{$s}' height='{$s}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>",
        ];
        return $icons[$name] ?? '';
    }

    /**
     * Build the blue bar section HTML.
     *
     * @return string HTML markup.
     */
    private static function build_bar_html()
    {
        $label_html =
            HTMLUtility::render([
                'tag'               => 'div',
                'attributes'        => ['class' => 'vvp-fc__bar-label-group'],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    self::get_icon('shield-check', 22) .
                    HTMLUtility::render([
                        'tag'               => 'div',
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          =>
                            HTMLUtility::render([
                                'tag'               => 'p',
                                'attributes'        => ['class' => 'vvp-fc__bar-title'],
                                'childrenSanitizer' => 'esc_html',
                                'children'          => __('Faktencheck-Archiv durchsuchen', 'vvp-fact-check-search'),
                            ]) .
                            HTMLUtility::render([
                                'tag'               => 'p',
                                'attributes'        => ['class' => 'vvp-fc__bar-desc'],
                                'childrenSanitizer' => 'esc_html',
                                'children'          => __('Text, Zitat oder URL eingeben. Wir zeigen passende Faktenchecks und bereits belegte Einordnungen.', 'vvp-fact-check-search'),
                            ]),
                    ]),
            ]);

        $actions_html =
            HTMLUtility::render([
                'tag'               => 'div',
                'attributes'        => ['class' => 'vvp-fc__bar-actions'],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    HTMLUtility::render([
                        'tag'               => 'button',
                        'attributes'        => [
                            'type'  => 'button',
                            'class' => 'vvp-fc__bar-trigger js-vvp-fc-open',
                        ],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          =>
                            self::get_icon('search', 15) .
                            HTMLUtility::render([
                                'tag'               => 'span',
                                'childrenSanitizer' => 'esc_html',
                                'children'          => __('z.B. eine strittige Behauptung, ein Zitat oder eine URL...', 'vvp-fact-check-search'),
                            ]),
                    ]) .
                    HTMLUtility::render([
                        'tag'               => 'button',
                        'attributes'        => [
                            'type'  => 'button',
                            'class' => 'vvp-fc__bar-btn js-vvp-fc-open',
                        ],
                        'childrenSanitizer' => 'esc_html',
                        'children'          => __('Im Archiv suchen', 'vvp-fact-check-search'),
                    ]),
            ]);

        return HTMLUtility::render([
            'tag'               => 'section',
            'attributes'        => ['class' => 'vvp-fc__bar'],
            'childrenSanitizer' => 'et_core_esc_previously',
            'children'          =>
                HTMLUtility::render([
                    'tag'               => 'div',
                    'attributes'        => ['class' => 'vvp-fc__bar-inner'],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children'          => $label_html . $actions_html,
                ]),
        ]);
    }

    /**
     * Build the search overlay HTML (initially hidden, activated by JS).
     *
     * @return string HTML markup.
     */
    private static function build_overlay_html()
    {
        // Header
        $header_html =
            HTMLUtility::render([
                'tag'               => 'div',
                'attributes'        => ['class' => 'vvp-fc__panel-header'],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    HTMLUtility::render([
                        'tag'               => 'div',
                        'attributes'        => ['class' => 'vvp-fc__panel-title'],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          =>
                            self::get_icon('search', 18) .
                            HTMLUtility::render([
                                'tag'               => 'span',
                                'childrenSanitizer' => 'esc_html',
                                'children'          => __('Faktencheck', 'vvp-fact-check-search'),
                            ]),
                    ]) .
                    HTMLUtility::render([
                        'tag'               => 'button',
                        'attributes'        => [
                            'type'       => 'button',
                            'class'      => 'vvp-fc__close-btn js-vvp-fc-close',
                            'aria-label' => __('Schließen', 'vvp-fact-check-search'),
                        ],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          => self::get_icon('x', 18),
                    ]),
            ]);

        // Search form
        $form_html =
            HTMLUtility::render([
                'tag'               => 'form',
                'attributes'        => ['class' => 'vvp-fc__search-form js-vvp-fc-form'],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    HTMLUtility::render([
                        'tag'               => 'div',
                        'attributes'        => ['class' => 'vvp-fc__input-row'],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          =>
                            HTMLUtility::render([
                                'tag'               => 'span',
                                'attributes'        => ['class' => 'vvp-fc__input-icon js-vvp-fc-input-icon'],
                                'childrenSanitizer' => 'et_core_esc_previously',
                                'children'          => self::get_icon('file-text', 16),
                            ]) .
                            HTMLUtility::render([
                                'tag'        => 'input',
                                'attributes' => [
                                    'type'        => 'text',
                                    'class'       => 'vvp-fc__text-input js-vvp-fc-input',
                                    'placeholder' => __('URL oder Text zum Faktencheck eingeben...', 'vvp-fact-check-search'),
                                    'autocomplete'=> 'off',
                                ],
                            ]) .
                            HTMLUtility::render([
                                'tag'               => 'button',
                                'attributes'        => [
                                    'type'     => 'submit',
                                    'class'    => 'vvp-fc__submit-btn js-vvp-fc-submit',
                                    'disabled' => 'disabled',
                                ],
                                'childrenSanitizer' => 'et_core_esc_previously',
                                'children'          =>
                                    HTMLUtility::render([
                                        'tag'               => 'span',
                                        'attributes'        => ['class' => 'vvp-fc__submit-icon'],
                                        'childrenSanitizer' => 'et_core_esc_previously',
                                        'children'          => self::get_icon('search', 14),
                                    ]) .
                                    HTMLUtility::render([
                                        'tag'               => 'span',
                                        'childrenSanitizer' => 'esc_html',
                                        'children'          => __('Prüfen', 'vvp-fact-check-search'),
                                    ]),
                            ]),
                    ]) .
                    HTMLUtility::render([
                        'tag'               => 'p',
                        'attributes'        => [
                            'class'  => 'vvp-fc__url-hint js-vvp-fc-url-hint',
                            'hidden' => 'hidden',
                        ],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          =>
                            self::get_icon('link', 12) .
                            HTMLUtility::render([
                                'tag'               => 'span',
                                'childrenSanitizer' => 'esc_html',
                                'children'          => __('Der Artikel wird zuerst importiert und dann geprüft.', 'vvp-fact-check-search'),
                            ]),
                    ]),
            ]);

        // Example queries
        $example_queries = [
            __('Corona-Impfungen verändern die DNA', 'vvp-fact-check-search'),
            __('Klimawandel ist eine Erfindung', 'vvp-fact-check-search'),
            __('Soros steuert die Medien', 'vvp-fact-check-search'),
            __('Asylbewerber bekommen mehr Geld als Rentner', 'vvp-fact-check-search'),
        ];

        $examples_buttons = '';
        foreach ($example_queries as $q) {
            $examples_buttons .= HTMLUtility::render([
                'tag'               => 'button',
                'attributes'        => [
                    'type'       => 'button',
                    'class'      => 'vvp-fc__example-btn js-vvp-fc-example',
                    'data-query' => esc_attr($q),
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    self::get_icon('trending-up', 13) .
                    HTMLUtility::render([
                        'tag'               => 'span',
                        'childrenSanitizer' => 'esc_html',
                        'children'          => $q,
                    ]),
            ]);
        }

        // All UI states
        $state_idle =
            HTMLUtility::render([
                'tag'               => 'div',
                'attributes'        => ['class' => 'vvp-fc__state js-vvp-fc-state-idle'],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    HTMLUtility::render([
                        'tag'               => 'p',
                        'attributes'        => ['class' => 'vvp-fc__examples-label'],
                        'childrenSanitizer' => 'esc_html',
                        'children'          => __('Beispiele', 'vvp-fact-check-search'),
                    ]) .
                    HTMLUtility::render([
                        'tag'               => 'div',
                        'attributes'        => ['class' => 'vvp-fc__examples-list'],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          => $examples_buttons,
                    ]),
            ]);

        $state_loading =
            HTMLUtility::render([
                'tag'               => 'div',
                'attributes'        => [
                    'class'  => 'vvp-fc__state vvp-fc__state--loading js-vvp-fc-state-loading',
                    'hidden' => 'hidden',
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    HTMLUtility::render([
                        'tag'               => 'div',
                        'attributes'        => ['class' => 'vvp-fc__spinner'],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          => "<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M21 12a9 9 0 1 1-6.219-8.56'/></svg>",
                    ]) .
                    HTMLUtility::render([
                        'tag'               => 'p',
                        'attributes'        => ['class' => 'js-vvp-fc-loading-text'],
                        'childrenSanitizer' => 'esc_html',
                        'children'          => __('Wird geprüft...', 'vvp-fact-check-search'),
                    ]),
            ]);

        $state_error =
            HTMLUtility::render([
                'tag'               => 'div',
                'attributes'        => [
                    'class'  => 'vvp-fc__state vvp-fc__state--error js-vvp-fc-state-error',
                    'hidden' => 'hidden',
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    self::get_icon('alert-circle', 18) .
                    HTMLUtility::render([
                        'tag'               => 'p',
                        'attributes'        => ['class' => 'js-vvp-fc-error-text'],
                        'childrenSanitizer' => 'esc_html',
                        'children'          => '',
                    ]),
            ]);

        $state_done =
            HTMLUtility::render([
                'tag'               => 'div',
                'attributes'        => [
                    'class'  => 'vvp-fc__state js-vvp-fc-state-done',
                    'hidden' => 'hidden',
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    HTMLUtility::render([
                        'tag'               => 'div',
                        'attributes'        => ['class' => 'vvp-fc__results-meta'],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          =>
                            HTMLUtility::render([
                                'tag'               => 'span',
                                'attributes'        => ['class' => 'js-vvp-fc-results-count'],
                                'childrenSanitizer' => 'esc_html',
                                'children'          => '',
                            ]) .
                            HTMLUtility::render([
                                'tag'               => 'span',
                                'attributes'        => ['class' => 'js-vvp-fc-results-time'],
                                'childrenSanitizer' => 'esc_html',
                                'children'          => '',
                            ]),
                    ]) .
                    HTMLUtility::render([
                        'tag'               => 'div',
                        'attributes'        => ['class' => 'vvp-fc__results-list js-vvp-fc-results-list'],
                        'childrenSanitizer' => 'esc_html',
                        'children'          => '',
                    ]),
            ]);

        // Assemble the panel
        $panel_html =
            HTMLUtility::render([
                'tag'               => 'div',
                'attributes'        => ['class' => 'vvp-fc__panel'],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children'          =>
                    $header_html .
                    $form_html .
                    HTMLUtility::render([
                        'tag'               => 'div',
                        'attributes'        => ['class' => 'vvp-fc__content-area'],
                        'childrenSanitizer' => 'et_core_esc_previously',
                        'children'          => $state_idle . $state_loading . $state_error . $state_done,
                    ]),
            ]);

        return HTMLUtility::render([
            'tag'               => 'div',
            'attributes'        => [
                'class'      => 'vvp-fc__overlay js-vvp-fc-overlay',
                'role'       => 'dialog',
                'aria-modal' => 'true',
                'aria-label' => __('Faktencheck-Suche', 'vvp-fact-check-search'),
                'hidden'     => 'hidden',
            ],
            'childrenSanitizer' => 'et_core_esc_previously',
            'children'          =>
                HTMLUtility::render([
                    'tag'               => 'div',
                    'attributes'        => ['class' => 'vvp-fc__backdrop js-vvp-fc-backdrop'],
                    'childrenSanitizer' => 'esc_html',
                    'children'          => '',
                ]) .
                $panel_html,
        ]);
    }

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
            $search_api_url = 'https://ai.volksverpetzer-app.de/api/vector-search';
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
                        'class'           => 'vvp-fc__wrapper',
                        'data-search-url' => esc_attr($search_api_url),
                        'data-import-url' => esc_attr($import_api_url),
                    ],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children'          => self::build_bar_html() . self::build_overlay_html(),
                ]),
            ],
        ]);
    }
}
