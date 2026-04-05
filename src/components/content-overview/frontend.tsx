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

const initAll = () => {
    initInstagramSlideshows();
    initPodcastBanners();
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
