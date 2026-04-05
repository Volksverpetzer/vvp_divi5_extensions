/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/fact-check-search/App.tsx"
/*!**************************************************!*\
  !*** ./src/components/fact-check-search/App.tsx ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FactCheckSearchApp: () => (/* binding */ FactCheckSearchApp)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./icons */ "./src/components/fact-check-search/icons.tsx");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};


var EXAMPLE_QUERIES = [
    'Corona-Impfungen verändern die DNA',
    'Klimawandel ist eine Erfindung',
    'Soros steuert die Medien',
    'Asylbewerber bekommen mehr Geld als Rentner',
];
var isUrl = function (str) {
    try {
        var u = new URL(str.trim());
        return u.protocol === 'http:' || u.protocol === 'https:';
    }
    catch (_) {
        return false;
    }
};
var FactCheckSearchApp = function (_a) {
    var searchApiUrl = _a.searchApiUrl, importApiUrl = _a.importApiUrl;
    var _b = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false), isOpen = _b[0], setIsOpen = _b[1];
    var _c = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('idle'), phase = _c[0], setPhase = _c[1];
    var _d = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(''), query = _d[0], setQuery = _d[1];
    var _e = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(''), errorText = _e[0], setErrorText = _e[1];
    var _f = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]), results = _f[0], setResults = _f[1];
    var _g = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null), tookTime = _g[0], setTookTime = _g[1];
    var inputRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    var openOverlay = function () {
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
        setQuery('');
        setPhase('idle');
        setTimeout(function () {
            if (inputRef.current)
                inputRef.current.focus();
        }, 60);
    };
    var closeOverlay = function () {
        setIsOpen(false);
        document.body.style.overflow = '';
    };
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
        var handleKeyDown = function (e) {
            if (e.key === 'Escape' && isOpen) {
                closeOverlay();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return function () { return document.removeEventListener('keydown', handleKeyDown); };
    }, [isOpen]);
    var runSearch = function (searchQuery) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!searchApiUrl) {
                        setPhase('error');
                        setErrorText('Keine Such-API URL konfiguriert.');
                        return [2 /*return*/];
                    }
                    setPhase('searching');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(searchApiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query: searchQuery }),
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error('HTTP ' + res.status);
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    setResults(data.results || []);
                    setTookTime(data.took != null ? data.took : null);
                    setPhase('done');
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    setPhase('error');
                    setErrorText('Die Suche ist fehlgeschlagen. Bitte versuche es erneut.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var trimmed, res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (e)
                        e.preventDefault();
                    trimmed = query.trim();
                    if (!trimmed)
                        return [2 /*return*/];
                    if (!isUrl(trimmed)) return [3 /*break*/, 6];
                    if (!importApiUrl) {
                        setPhase('error');
                        setErrorText('Keine Import-API URL konfiguriert.');
                        return [2 /*return*/];
                    }
                    setPhase('importing');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(importApiUrl + '?url=' + encodeURIComponent(trimmed))];
                case 2:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error('HTTP ' + res.status);
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    runSearch(data.snippet || trimmed);
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    setPhase('error');
                    setErrorText('Der Artikel konnte nicht geladen werden. Bitte versuche es mit einem anderen Link.');
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    runSearch(trimmed);
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleExampleClick = function (q) {
        setQuery(q);
        // Using setTimeout to ensure UI updates before fetching, similar to original behavior
        setTimeout(function () {
            if (!searchApiUrl) {
                setPhase('error');
                setErrorText('Keine Such-API URL konfiguriert.');
                return;
            }
            setPhase('searching');
            fetch(searchApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q }),
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                setResults(data.results || []);
                setTookTime(data.took != null ? data.took : null);
                setPhase('done');
            })
                .catch(function () {
                setPhase('error');
                setErrorText('Die Suche ist fehlgeschlagen. Bitte versuche es erneut.');
            });
        }, 0);
    };
    var isUrlQuery = isUrl(query);
    var disableSubmit = !query.trim() || phase === 'importing' || phase === 'searching';
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__wrapper" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("section", { className: "vvp-fc__bar" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__bar-inner" },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__bar-label-group" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconShieldCheck, { size: 22 }),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null,
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: "vvp-fc__bar-title" }, "Faktencheck-Archiv durchsuchen"),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: "vvp-fc__bar-desc" }, "Text, Zitat oder URL eingeben. Wir zeigen passende Faktenchecks und bereits belegte Einordnungen."))),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__bar-actions" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", { type: "button", className: "vvp-fc__bar-trigger js-vvp-fc-open", onClick: openOverlay },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconSearch, { size: 15 }),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "z.B. eine strittige Behauptung, ein Zitat oder eine URL...")),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", { type: "button", className: "vvp-fc__bar-btn js-vvp-fc-open", onClick: openOverlay }, "Im Archiv suchen")))),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__overlay js-vvp-fc-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Faktencheck-Suche", hidden: !isOpen },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__backdrop js-vvp-fc-backdrop", onClick: closeOverlay }),
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__panel" },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__panel-header" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__panel-title" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconSearch, { size: 18 }),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "Faktencheck")),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", { type: "button", className: "vvp-fc__close-btn js-vvp-fc-close", "aria-label": "Schlie\u00DFen", onClick: closeOverlay },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconX, { size: 18 }))),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("form", { className: "vvp-fc__search-form js-vvp-fc-form", onSubmit: handleSubmit },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__input-row" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "vvp-fc__input-icon js-vvp-fc-input-icon" }, isUrlQuery ? react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconLink, { size: 16 }) : react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconFileText, { size: 16 })),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", { ref: inputRef, type: "text", className: "vvp-fc__text-input js-vvp-fc-input", placeholder: "URL oder Text zum Faktencheck eingeben...", autoComplete: "off", value: query, onChange: function (e) { return setQuery(e.target.value); } }),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", { type: "submit", className: "vvp-fc__submit-btn js-vvp-fc-submit", disabled: disableSubmit },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "vvp-fc__submit-icon" },
                                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconSearch, { size: 14 })),
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "Pr\u00FCfen"))),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: "vvp-fc__url-hint js-vvp-fc-url-hint", hidden: !isUrlQuery },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconLink, { size: 12 }),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "Der Artikel wird zuerst importiert und dann gepr\u00FCft."))),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__content-area" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__state js-vvp-fc-state-idle", hidden: phase !== 'idle' },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: "vvp-fc__examples-label" }, "Beispiele"),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__examples-list" }, EXAMPLE_QUERIES.map(function (q, i) { return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", { key: i, type: "button", className: "vvp-fc__example-btn js-vvp-fc-example", "data-query": q, onClick: function () { return handleExampleClick(q); } },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconTrendingUp, { size: 13 }),
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, q))); }))),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__state vvp-fc__state--loading js-vvp-fc-state-loading", hidden: phase !== 'importing' && phase !== 'searching' },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__spinner" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
                                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }))),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: "js-vvp-fc-loading-text" }, phase === 'importing' ? 'Artikel wird importiert...' : 'Wird geprüft...')),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__state vvp-fc__state--error js-vvp-fc-state-error", hidden: phase !== 'error' },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconAlertCircle, { size: 18 }),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: "js-vvp-fc-error-text" }, errorText)),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__state js-vvp-fc-state-done", hidden: phase !== 'done' },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__results-meta" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "js-vvp-fc-results-count" }, results.length === 0 ? 'Keine Treffer gefunden' : "".concat(results.length, " relevante Artikel gefunden")),
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "js-vvp-fc-results-time" }, tookTime != null ? "".concat(tookTime, " ms") : '')),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__results-list js-vvp-fc-results-list" }, results.length === 0 ? (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: "vvp-fc__no-results" }, "Zu dieser Aussage wurden keine passenden Artikel gefunden.")) : (results.map(function (r, i) {
                            var score = r.rerank_score != null ? r.rerank_score : r.lexical_score;
                            var pct = Math.min(100, Math.round(score * 100));
                            var modClass = pct >= 70 ? '' : (pct >= 40 ? ' vvp-fc__score-fill--medium' : ' vvp-fc__score-fill--low');
                            var title = r.title || 'Ohne Titel';
                            var excerpt = r.excerpt || '';
                            var url = r.url || '#';
                            return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("a", { key: i, className: "vvp-fc__result-card", href: url, target: "_blank", rel: "noopener noreferrer" },
                                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__result-rank" }, i + 1),
                                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__result-body" },
                                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__result-header" },
                                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", { className: "vvp-fc__result-title" }, title),
                                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "vvp-fc__result-ext-icon" },
                                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_icons__WEBPACK_IMPORTED_MODULE_1__.IconExternalLink, { size: 13 }))),
                                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: "vvp-fc__result-excerpt" }, excerpt),
                                    score != null && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__score-bar" },
                                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__score-track" },
                                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-fc__score-fill".concat(modClass), style: { width: "".concat(pct, "%") } })),
                                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "vvp-fc__score-label" },
                                            pct,
                                            "%"))))));
                        })))))))));
};


/***/ },

/***/ "./src/components/fact-check-search/icons.tsx"
/*!****************************************************!*\
  !*** ./src/components/fact-check-search/icons.tsx ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IconAlertCircle: () => (/* binding */ IconAlertCircle),
/* harmony export */   IconExternalLink: () => (/* binding */ IconExternalLink),
/* harmony export */   IconFileText: () => (/* binding */ IconFileText),
/* harmony export */   IconLink: () => (/* binding */ IconLink),
/* harmony export */   IconSearch: () => (/* binding */ IconSearch),
/* harmony export */   IconShieldCheck: () => (/* binding */ IconShieldCheck),
/* harmony export */   IconTrendingUp: () => (/* binding */ IconTrendingUp),
/* harmony export */   IconX: () => (/* binding */ IconX)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

var IconSearch = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 18 : _b;
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("circle", { cx: "11", cy: "11", r: "8" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })));
};
var IconX = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 18 : _b;
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })));
};
var IconShieldCheck = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 22 : _b;
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("polyline", { points: "9 12 11 14 15 10" })));
};
var IconLink = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 16 : _b;
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })));
};
var IconFileText = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 16 : _b;
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("polyline", { points: "14 2 14 8 20 8" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("line", { x1: "16", y1: "17", x2: "8", y2: "17" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("polyline", { points: "10 9 9 9 8 9" })));
};
var IconTrendingUp = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 13 : _b;
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("polyline", { points: "16 7 22 7 22 13" })));
};
var IconAlertCircle = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 18 : _b;
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("circle", { cx: "12", cy: "12", r: "10" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })));
};
var IconExternalLink = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 13 : _b;
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("polyline", { points: "15 3 21 3 21 9" }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("line", { x1: "10", y1: "14", x2: "21", y2: "3" })));
};


/***/ },

/***/ "react"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = wp.element;

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************************************!*\
  !*** ./src/components/fact-check-search/frontend.tsx ***!
  \*******************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./App */ "./src/components/fact-check-search/App.tsx");


// @ts-ignore
var wpEl = function () { return window.wp && window.wp.element; };
// @ts-ignore
var rdOM = function () { return window.ReactDOM; };
var mountReact = function (component, container) {
    var _a, _b, _c, _d;
    if ((_a = wpEl()) === null || _a === void 0 ? void 0 : _a.createRoot) {
        wpEl().createRoot(container).render(component);
    }
    else if ((_b = rdOM()) === null || _b === void 0 ? void 0 : _b.createRoot) {
        rdOM().createRoot(container).render(component);
    }
    else if ((_c = wpEl()) === null || _c === void 0 ? void 0 : _c.render) {
        wpEl().render(component, container);
    }
    else if ((_d = rdOM()) === null || _d === void 0 ? void 0 : _d.render) {
        rdOM().render(component, container);
    }
    else {
        console.error("React render function not found globally.");
    }
};
var initAll = function () {
    var mounts = document.querySelectorAll('.vvp-fc__mount:not([data-fc-initialized="true"])');
    mounts.forEach(function (mount) {
        mount.setAttribute('data-fc-initialized', 'true');
        var searchApiUrl = mount.getAttribute('data-search-url') || '';
        var importApiUrl = mount.getAttribute('data-import-url') || '';
        mountReact(react__WEBPACK_IMPORTED_MODULE_0__.createElement(_App__WEBPACK_IMPORTED_MODULE_1__.FactCheckSearchApp, { searchApiUrl: searchApiUrl, importApiUrl: importApiUrl }), mount);
    });
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
}
else {
    initAll();
}
// React to Divi ajax and module re-inits on the frontend
document.addEventListener('et_pb_reinit_modules', initAll);
document.addEventListener('ajaxComplete', initAll);
if (document.body && 'MutationObserver' in window) {
    var observer = new MutationObserver(initAll);
    observer.observe(document.body, { childList: true, subtree: true });
}

})();

/******/ })()
;
//# sourceMappingURL=fact-check-frontend.js.map