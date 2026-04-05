/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/content-overview/InstagramSlideshow.tsx"
/*!****************************************************************!*\
  !*** ./src/components/content-overview/InstagramSlideshow.tsx ***!
  \****************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InstagramSlideshow: () => (/* binding */ InstagramSlideshow)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);


var InstaIcon = function () { return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "13", height: "13", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" },
    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", { d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" }))); };
var ArrowLeftIcon = function () { return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("polyline", { points: "15 18 9 12 15 6" }))); };
var ArrowRightIcon = function () { return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("polyline", { points: "9 18 15 12 9 6" }))); };
var InternalSlider = function (_a) {
    var slides = _a.slides, activeIndex = _a.activeIndex, setActiveIndex = _a.setActiveIndex, isCarousel = _a.isCarousel, caption = _a.caption, playingVideos = _a.playingVideos, setPlayingVideos = _a.setPlayingVideos;
    var _b = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false), showArrows = _b[0], setShowArrows = _b[1];
    var arrowTimeout = react__WEBPACK_IMPORTED_MODULE_0___default().useRef(null);
    var touchStartX = react__WEBPACK_IMPORTED_MODULE_0___default().useRef(0);
    var touchEndX = react__WEBPACK_IMPORTED_MODULE_0___default().useRef(0);
    var handleNext = function (e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setPlayingVideos({}); // Clear playing videos on slide change
        setActiveIndex(function (prev) { return (prev + 1) % slides.length; });
    };
    var handlePrev = function (e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setPlayingVideos({}); // Clear playing videos on slide change
        setActiveIndex(function (prev) { return (prev - 1 + slides.length) % slides.length; });
    };
    var handleMouseMove = function () {
        setShowArrows(true);
        if (arrowTimeout.current)
            clearTimeout(arrowTimeout.current);
        arrowTimeout.current = setTimeout(function () {
            setShowArrows(false);
        }, 1500);
    };
    var handleMouseLeave = function () {
        if (arrowTimeout.current)
            clearTimeout(arrowTimeout.current);
        setShowArrows(false);
    };
    var handleTouchStart = function (e) {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = e.targetTouches[0].clientX; // Reset end x
    };
    var handleTouchMove = function (e) {
        touchEndX.current = e.targetTouches[0].clientX;
    };
    var handleTouchEnd = function () {
        if (!touchStartX.current || !touchEndX.current)
            return;
        var distance = touchStartX.current - touchEndX.current;
        if (Math.abs(distance) > 40) { // 40px swipe threshold
            if (distance > 0) {
                handleNext();
            }
            else {
                handlePrev();
            }
        }
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-co__insta-slider-wrap", style: { position: 'relative' }, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave, onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: classnames__WEBPACK_IMPORTED_MODULE_1___default()('et_pb_slider et_pb_slider_fullwidth_off', {
                'et_pb_slider_no_arrows': !isCarousel,
                'et_pb_slider_no_pagination': !isCarousel
            }), style: { background: '#000', paddingBottom: 0 } },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "et_pb_slides", style: { position: 'relative', overflow: 'hidden' } }, slides.map(function (slide, index) {
                var isVideo = !!slide.video;
                var isActive = index === activeIndex;
                var isPlaying = !!playingVideos[index];
                return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: classnames__WEBPACK_IMPORTED_MODULE_1___default()('et_pb_slide et_pb_slide_with_image', { 'et-pb-active-slide': isActive }), key: index, style: {
                        display: isActive ? 'block' : 'none',
                        transition: 'all 0.4s ease-in-out'
                    } },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "et_pb_container clearfix" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "et_pb_slider_container_inner" }, isVideo ? (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "et_pb_slide_image", style: { position: 'relative' } }, !isPlaying ? (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { style: { position: 'relative', cursor: 'pointer', width: '100%' }, onClick: function () {
                                var _a;
                                return setPlayingVideos((_a = {}, _a[index] = true, _a));
                            }, onMouseEnter: function () {
                                var _a;
                                return setPlayingVideos((_a = {}, _a[index] = true, _a));
                            } },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", { src: slide.thumb || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', alt: caption, style: { width: '100%', display: 'block' }, loading: index === 0 ? "eager" : "lazy" }),
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { style: {
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: 64, height: 64,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                } },
                                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "white" },
                                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", { d: "M8 5v14l11-7z" }))))) : (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("video", { loop: true, playsInline: true, preload: "metadata", controls: true, autoPlay: true, muted: true, style: { width: '100%', display: 'block' }, onPlay: function (e) {
                                var currentTarget = e.currentTarget;
                                document.querySelectorAll('video').forEach(function (video) {
                                    if (video !== currentTarget)
                                        video.pause();
                                });
                            } },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("source", { type: "video/mp4", src: slide.video }))))) : (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "et_pb_slide_image" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", { src: slide.thumb, alt: caption, loading: index === 0 ? "eager" : "lazy", decoding: "async", style: { width: '100%', display: 'block' } })))))));
            })),
            isCarousel && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null,
                showArrows && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "et-pb-slider-arrows" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("a", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', color: '#000', borderRadius: '50%', width: 36, height: 36, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 10, textDecoration: 'none' }, href: "#", onClick: handlePrev },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(ArrowLeftIcon, null)),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("a", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', color: '#000', borderRadius: '50%', width: 36, height: 36, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 10, textDecoration: 'none' }, href: "#", onClick: handleNext },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(ArrowRightIcon, null)))),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "et-pb-controllers", style: { position: 'relative', marginTop: 10, paddingBottom: 15, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 10 } }, slides.map(function (_, index) { return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("a", { key: index, href: "#", style: {
                        width: 8, height: 8, borderRadius: '50%', background: index === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)', textIndent: -9999, overflow: 'hidden', display: 'block'
                    }, onClick: function (e) { e.preventDefault(); e.stopPropagation(); setActiveIndex(index); } }, "1")); })))))));
};
var InstagramSlideshow = function (_a) {
    var permalink = _a.permalink, caption = _a.caption, date = _a.date, badgeLabel = _a.badgeLabel, slides = _a.slides, isCarousel = _a.isCarousel;
    var _b = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0), activeIndex = _b[0], setActiveIndex = _b[1];
    var _c = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({}), playingVideos = _c[0], setPlayingVideos = _c[1];
    var _d = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false), isFullscreen = _d[0], setFullscreen = _d[1];
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return function () { document.body.style.overflow = ''; };
    }, [isFullscreen]);
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null,
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-co__feed-card vvp-co__feed-card--insta" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InternalSlider, { slides: slides, activeIndex: activeIndex, setActiveIndex: setActiveIndex, isCarousel: isCarousel, caption: caption, playingVideos: playingVideos, setPlayingVideos: setPlayingVideos }),
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-co__feed-body vvp-co__feed-body--link", onClick: function () { return setFullscreen(true); }, style: { cursor: 'pointer' } },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "vvp-co__feed-meta" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "vvp-co__badge vvp-co__badge--insta" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InstaIcon, null),
                        badgeLabel)),
                caption && react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { className: "vvp-co__feed-excerpt vvp-co__feed-excerpt--insta", style: { pointerEvents: 'none' } }, caption),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "vvp-co__feed-date", style: { pointerEvents: 'none' } }, date))),
        isFullscreen && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { onClick: function () { return setFullscreen(false); }, style: {
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.95)', zIndex: 99999, overflowY: 'auto', display: 'block'
            } },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", { onClick: function () { return setFullscreen(false); }, style: { position: 'fixed', top: 20, right: 30, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 32, cursor: 'pointer', zIndex: 100000, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "\u00D7"),
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { onClick: function (e) { return e.stopPropagation(); }, style: { margin: '60px auto 60px auto', width: '100%', maxWidth: 700, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 } },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InternalSlider, { slides: slides, activeIndex: activeIndex, setActiveIndex: setActiveIndex, isCarousel: isCarousel, caption: caption, playingVideos: playingVideos, setPlayingVideos: setPlayingVideos }),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { style: { background: '#111', padding: 20, borderRadius: 12, color: 'white' } },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 } },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "vvp-co__badge vvp-co__badge--insta" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InstaIcon, null),
                            badgeLabel),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("a", { href: permalink, target: "_blank", rel: "noopener noreferrer", style: { color: '#3893C0', textDecoration: 'none', fontSize: 13, fontWeight: 'bold' } }, "Auf Instagram ansehen \u2197")),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", { style: { whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 15, margin: 0 } }, caption),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { style: { marginTop: 20, color: '#666', fontSize: 13 } }, date)))))));
};


/***/ },

/***/ "react"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

"use strict";
module.exports = wp.element;

/***/ },

/***/ "./node_modules/classnames/index.js"
/*!******************************************!*\
  !*** ./node_modules/classnames/index.js ***!
  \******************************************/
(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = '';

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (arg) {
				classes = appendClass(classes, parseValue(arg));
			}
		}

		return classes;
	}

	function parseValue (arg) {
		if (typeof arg === 'string' || typeof arg === 'number') {
			return arg;
		}

		if (typeof arg !== 'object') {
			return '';
		}

		if (Array.isArray(arg)) {
			return classNames.apply(null, arg);
		}

		if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
			return arg.toString();
		}

		var classes = '';

		for (var key in arg) {
			if (hasOwn.call(arg, key) && arg[key]) {
				classes = appendClass(classes, key);
			}
		}

		return classes;
	}

	function appendClass (value, newClass) {
		if (!newClass) {
			return value;
		}
	
		if (value) {
			return value + ' ' + newClass;
		}
	
		return value + newClass;
	}

	if ( true && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else // removed by dead control flow
{}
}());


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
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!******************************************************!*\
  !*** ./src/components/content-overview/frontend.tsx ***!
  \******************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _InstagramSlideshow__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./InstagramSlideshow */ "./src/components/content-overview/InstagramSlideshow.tsx");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};


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
var initInstagramSlideshows = function () {
    var mounts = document.querySelectorAll('.vvp-co-ig-mount:not([data-ig-initialized="true"])');
    mounts.forEach(function (mount) {
        mount.setAttribute('data-ig-initialized', 'true');
        var rawProps = mount.getAttribute('data-ig-props');
        if (rawProps) {
            try {
                var props = JSON.parse(rawProps);
                mountReact(react__WEBPACK_IMPORTED_MODULE_0__.createElement(_InstagramSlideshow__WEBPACK_IMPORTED_MODULE_1__.InstagramSlideshow, __assign({}, props)), mount);
            }
            catch (e) {
                console.error("Failed to parse Instagram slideshow props", e);
            }
        }
    });
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstagramSlideshows);
}
else {
    initInstagramSlideshows();
}
// Re-init hooks for Divi Builder and AJAX
document.addEventListener('et_pb_reinit_modules', initInstagramSlideshows);
document.addEventListener('ajaxComplete', initInstagramSlideshows);
if (document.body && 'MutationObserver' in window) {
    var observer = new MutationObserver(initInstagramSlideshows);
    observer.observe(document.body, { childList: true, subtree: true });
}

})();

/******/ })()
;
//# sourceMappingURL=content-overview-frontend.js.map