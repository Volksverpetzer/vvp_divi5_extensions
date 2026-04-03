/**
 * Faktencheck Search — Frontend Interactivity
 *
 * Implements the full search overlay behaviour from search.tsx as vanilla JS.
 * Works with the HTML structure rendered by FactCheckSearch::render_callback().
 *
 * Expected DOM (inside .vvp-fc__wrapper[data-search-url][data-import-url]):
 *   .vvp-fc__bar
 *     .js-vvp-fc-open          (one or more open-overlay triggers)
 *   .vvp-fc__overlay.js-vvp-fc-overlay[hidden]
 *     .js-vvp-fc-backdrop
 *     .vvp-fc__panel
 *       .js-vvp-fc-close
 *       form.js-vvp-fc-form
 *         .js-vvp-fc-input-icon
 *         input.js-vvp-fc-input
 *         button.js-vvp-fc-submit
 *         p.js-vvp-fc-url-hint[hidden]
 *       .vvp-fc__content-area
 *         .js-vvp-fc-state-idle
 *           .js-vvp-fc-example (multiple)
 *         .js-vvp-fc-state-loading[hidden]
 *           .js-vvp-fc-loading-text
 *         .js-vvp-fc-state-error[hidden]
 *           .js-vvp-fc-error-text
 *         .js-vvp-fc-state-done[hidden]
 *           .js-vvp-fc-results-count
 *           .js-vvp-fc-results-time
 *           .js-vvp-fc-results-list
 */
(function () {
    'use strict';

    // ─── SVG helpers ─────────────────────────────────────────────────────────

    function svgSearch(size) {
        size = size || 14;
        return "<svg xmlns='http://www.w3.org/2000/svg' width='" + size + "' height='" + size + "' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>";
    }

    function svgLink(size) {
        size = size || 16;
        return "<svg xmlns='http://www.w3.org/2000/svg' width='" + size + "' height='" + size + "' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/><path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/></svg>";
    }

    function svgFileText(size) {
        size = size || 16;
        return "<svg xmlns='http://www.w3.org/2000/svg' width='" + size + "' height='" + size + "' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/></svg>";
    }

    function svgExternalLink(size) {
        size = size || 13;
        return "<svg xmlns='http://www.w3.org/2000/svg' width='" + size + "' height='" + size + "' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/><polyline points='15 3 21 3 21 9'/><line x1='10' y1='14' x2='21' y2='3'/></svg>";
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    function isUrl(str) {
        try {
            var u = new URL(str.trim());
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ─── Score bar ────────────────────────────────────────────────────────────

    function buildScoreBar(score) {
        if (score == null) return '';
        var pct = Math.min(100, Math.round(score * 100));
        var modClass = pct >= 70 ? '' : (pct >= 40 ? ' vvp-fc__score-fill--medium' : ' vvp-fc__score-fill--low');
        return (
            '<div class="vvp-fc__score-bar">' +
                '<div class="vvp-fc__score-track">' +
                    '<div class="vvp-fc__score-fill' + modClass + '" style="width:' + pct + '%"></div>' +
                '</div>' +
                '<span class="vvp-fc__score-label">' + pct + '%</span>' +
            '</div>'
        );
    }

    // ─── Result card builder ──────────────────────────────────────────────────

    function buildResultCard(result, index) {
        var score = result.rerank_score != null ? result.rerank_score : result.lexical_score;
        var scoreHtml = buildScoreBar(score);
        var title = escHtml(result.title || 'Ohne Titel');
        var excerpt = escHtml(result.excerpt || '');
        var url = result.url ? escHtml(result.url) : '#';

        return (
            '<a class="vvp-fc__result-card" href="' + url + '" target="_blank" rel="noopener noreferrer">' +
                '<div class="vvp-fc__result-rank">' + (index + 1) + '</div>' +
                '<div class="vvp-fc__result-body">' +
                    '<div class="vvp-fc__result-header">' +
                        '<h3 class="vvp-fc__result-title">' + title + '</h3>' +
                        '<span class="vvp-fc__result-ext-icon">' + svgExternalLink(13) + '</span>' +
                    '</div>' +
                    '<p class="vvp-fc__result-excerpt">' + excerpt + '</p>' +
                    scoreHtml +
                '</div>' +
            '</a>'
        );
    }

    // ─── Per-instance initialisation ─────────────────────────────────────────

    function initWrapper(wrapper) {
        if (wrapper.dataset.fcInitialized) return;
        wrapper.dataset.fcInitialized = 'true';

        var searchApiUrl = wrapper.dataset.searchUrl || '';
        var importApiUrl = wrapper.dataset.importUrl || '';

        var overlay     = wrapper.querySelector('.js-vvp-fc-overlay');
        var backdrop    = wrapper.querySelector('.js-vvp-fc-backdrop');
        var form        = wrapper.querySelector('.js-vvp-fc-form');
        var inputEl     = wrapper.querySelector('.js-vvp-fc-input');
        var inputIcon   = wrapper.querySelector('.js-vvp-fc-input-icon');
        var submitBtn   = wrapper.querySelector('.js-vvp-fc-submit');
        var urlHint     = wrapper.querySelector('.js-vvp-fc-url-hint');
        var loadingText = wrapper.querySelector('.js-vvp-fc-loading-text');

        var stateIdle    = wrapper.querySelector('.js-vvp-fc-state-idle');
        var stateLoading = wrapper.querySelector('.js-vvp-fc-state-loading');
        var stateError   = wrapper.querySelector('.js-vvp-fc-state-error');
        var stateDone    = wrapper.querySelector('.js-vvp-fc-state-done');

        var errorText    = wrapper.querySelector('.js-vvp-fc-error-text');
        var resultsCount = wrapper.querySelector('.js-vvp-fc-results-count');
        var resultsTime  = wrapper.querySelector('.js-vvp-fc-results-time');
        var resultsList  = wrapper.querySelector('.js-vvp-fc-results-list');

        if (!overlay || !form || !inputEl) return;

        // ── State management ────────────────────────────────────────────────

        var currentPhase = 'idle'; // idle | importing | searching | done | error

        function setPhase(phase) {
            currentPhase = phase;

            // Show/hide state blocks
            toggle(stateIdle,    phase === 'idle');
            toggle(stateLoading, phase === 'importing' || phase === 'searching');
            toggle(stateError,   phase === 'error');
            toggle(stateDone,    phase === 'done');

            // Update loading text
            if (loadingText) {
                loadingText.textContent = phase === 'importing'
                    ? 'Artikel wird importiert...'
                    : 'Wird geprüft...';
            }

            // Disable submit while loading
            if (submitBtn) {
                submitBtn.disabled = (phase === 'importing' || phase === 'searching' || !inputEl.value.trim());
            }
        }

        function toggle(el, show) {
            if (!el) return;
            if (show) {
                el.removeAttribute('hidden');
            } else {
                el.setAttribute('hidden', 'hidden');
            }
        }

        // ── Overlay open / close ────────────────────────────────────────────

        function openOverlay() {
            overlay.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
            // Reset to idle
            if (inputEl) inputEl.value = '';
            setPhase('idle');
            updateInputIcon();
            // Focus input after transition
            setTimeout(function () { if (inputEl) inputEl.focus(); }, 60);
        }

        function closeOverlay() {
            overlay.setAttribute('hidden', 'hidden');
            document.body.style.overflow = '';
        }

        // ── Input icon & URL hint ────────────────────────────────────────────

        function updateInputIcon() {
            var val = inputEl ? inputEl.value : '';
            var url = isUrl(val.trim());

            if (inputIcon) {
                inputIcon.innerHTML = url ? svgLink(16) : svgFileText(16);
            }
            if (urlHint) {
                toggle(urlHint, url);
            }
            if (submitBtn) {
                submitBtn.disabled = (
                    !val.trim() ||
                    currentPhase === 'importing' ||
                    currentPhase === 'searching'
                );
            }
        }

        // ── Search logic ─────────────────────────────────────────────────────

        function runSearch(query) {
            if (!searchApiUrl) {
                setPhase('error');
                if (errorText) errorText.textContent = 'Keine Such-API URL konfiguriert.';
                return;
            }

            setPhase('searching');

            fetch(searchApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query }),
            })
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(function (data) {
                    var results = data.results || [];
                    var took    = data.took != null ? data.took : null;

                    if (resultsCount) {
                        resultsCount.textContent = results.length === 0
                            ? 'Keine Treffer gefunden'
                            : results.length + ' relevante Artikel gefunden';
                    }
                    if (resultsTime) {
                        resultsTime.textContent = took != null ? took + ' ms' : '';
                    }
                    if (resultsList) {
                        if (results.length === 0) {
                            resultsList.innerHTML = '<p class="vvp-fc__no-results">Zu dieser Aussage wurden keine passenden Artikel gefunden.</p>';
                        } else {
                            resultsList.innerHTML = results.map(function (r, i) {
                                return buildResultCard(r, i);
                            }).join('');
                        }
                    }

                    setPhase('done');
                })
                .catch(function () {
                    setPhase('error');
                    if (errorText) errorText.textContent = 'Die Suche ist fehlgeschlagen. Bitte versuche es erneut.';
                });
        }

        function handleSubmit(value) {
            var trimmed = value.trim();
            if (!trimmed) return;

            if (isUrl(trimmed)) {
                if (!importApiUrl) {
                    setPhase('error');
                    if (errorText) errorText.textContent = 'Keine Import-API URL konfiguriert.';
                    return;
                }

                setPhase('importing');

                fetch(importApiUrl + '?url=' + encodeURIComponent(trimmed))
                    .then(function (res) {
                        if (!res.ok) throw new Error('HTTP ' + res.status);
                        return res.json();
                    })
                    .then(function (data) {
                        var snippet = data.snippet || '';
                        runSearch(snippet || trimmed);
                    })
                    .catch(function () {
                        setPhase('error');
                        if (errorText) errorText.textContent = 'Der Artikel konnte nicht geladen werden. Bitte versuche es mit einem anderen Link.';
                    });
            } else {
                runSearch(trimmed);
            }
        }

        // ── Event listeners ──────────────────────────────────────────────────

        // Open buttons (bar trigger + "Im Archiv suchen")
        var openBtns = wrapper.querySelectorAll('.js-vvp-fc-open');
        openBtns.forEach(function (btn) {
            btn.addEventListener('click', openOverlay);
        });

        // Close button inside panel
        var closeBtn = overlay.querySelector('.js-vvp-fc-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeOverlay);
        }

        // Backdrop click
        if (backdrop) {
            backdrop.addEventListener('click', closeOverlay);
        }

        // Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) {
                closeOverlay();
            }
        });

        // Input changes
        if (inputEl) {
            inputEl.addEventListener('input', updateInputIcon);
        }

        // Form submit
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (inputEl) handleSubmit(inputEl.value);
            });
        }

        // Example query buttons
        var exampleBtns = overlay.querySelectorAll('.js-vvp-fc-example');
        exampleBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var q = btn.dataset.query || '';
                if (inputEl) inputEl.value = q;
                updateInputIcon();
                handleSubmit(q);
            });
        });

        // Initialise icon state
        updateInputIcon();
    }

    // ─── Bootstrap ───────────────────────────────────────────────────────────

    var initTimer = null;

    function scheduleInit() {
        if (initTimer) clearTimeout(initTimer);
        initTimer = setTimeout(initAll, 100);
    }

    function initAll() {
        var wrappers = document.querySelectorAll('.vvp-fc__wrapper');
        wrappers.forEach(initWrapper);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    document.addEventListener('et_pb_reinit_modules', scheduleInit);
    document.addEventListener('ajaxComplete', scheduleInit);

    if (document.body && 'MutationObserver' in window) {
        var observer = new MutationObserver(scheduleInit);
        observer.observe(document.body, { childList: true, subtree: true });
    }

})();
