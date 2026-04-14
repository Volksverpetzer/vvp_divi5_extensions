import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { InstagramSlideshow } from './InstagramSlideshow';
import { PodcastBanner } from './PodcastBanner';

const initInstagramSlideshows = () => {
    const mounts = document.querySelectorAll('.vvp-co-ig-mount:not([data-ig-initialized="true"])');
    mounts.forEach((mount) => {
        mount.setAttribute('data-ig-initialized', 'true');
        const rawProps = mount.getAttribute('data-ig-props');
        if (rawProps) {
            try {
                const props = JSON.parse(rawProps);
                createRoot(mount).render(<InstagramSlideshow {...props} />);
            } catch (e) {
                console.error("Failed to parse Instagram slideshow props", e);
            }
        }
    });
};

const initPodcastBanners = () => {
    const mounts = document.querySelectorAll('.vvp-co-podcast-mount:not([data-podcast-initialized="true"])');
    mounts.forEach((mount) => {
        mount.setAttribute('data-podcast-initialized', 'true');
        const rawProps = mount.getAttribute('data-podcast-props');
        if (rawProps) {
            try {
                const props = JSON.parse(rawProps);
                createRoot(mount).render(<PodcastBanner {...props} />);
            } catch (e) {
                console.error("Failed to parse podcast banner props", e);
            }
        }
    });
};

const LS_KEY = 'vvp_co_articles_only';

const applyArticlesFilter = (grid: Element, checked: boolean) => {
    grid.classList.toggle('vvp-co__feed-grid--articles-only', checked);
};

const initArticlesToggle = (wrapper: Element) => {
    const toggle = wrapper.querySelector<HTMLInputElement>('.vvp-co__toggle-input');
    const grid   = wrapper.querySelector<HTMLElement>('.vvp-co__feed-grid');
    if (!toggle || !grid) return;

    let stored = false;
    try { stored = localStorage.getItem(LS_KEY) === 'true'; } catch (_) {}
    toggle.checked = stored;
    applyArticlesFilter(grid, stored);

    toggle.addEventListener('change', () => {
        try { localStorage.setItem(LS_KEY, String(toggle.checked)); } catch (_) {}
        applyArticlesFilter(grid, toggle.checked);
    });
};

const initToggles = () => {
    document.querySelectorAll<HTMLElement>('.vvp-co__wrapper:not([data-toggle-initialized])').forEach((wrapper) => {
        wrapper.setAttribute('data-toggle-initialized', 'true');
        initArticlesToggle(wrapper);
    });
};

const initAll = () => {
    initInstagramSlideshows();
    initPodcastBanners();
    initToggles();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// Re-init hooks for Divi Builder and AJAX
document.addEventListener('et_pb_reinit_modules', initAll);
document.addEventListener('ajaxComplete', initAll);

if (document.body && 'MutationObserver' in window) {
    const observer = new MutationObserver(initAll);
    observer.observe(document.body, { childList: true, subtree: true });
}
