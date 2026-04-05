import React from 'react';
import ReactDOM from 'react-dom';
import { InstagramSlideshow } from './InstagramSlideshow';

const initInstagramSlideshows = () => {
    const mounts = document.querySelectorAll('.vvp-co-ig-mount:not([data-ig-initialized="true"])');
    mounts.forEach((mount) => {
        mount.setAttribute('data-ig-initialized', 'true');
        const propsRaw = mount.getAttribute('data-ig-props');
        if (propsRaw) {
            try {
                const props = JSON.parse(propsRaw);
                // ReactDOM corresponds to wp.element.render when loaded in frontend bundle
                ReactDOM.render(<InstagramSlideshow {...props} />, mount);
            } catch (e) {
                console.error("Failed to parse Instagram slideshow props", e);
            }
        }
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstagramSlideshows);
} else {
    initInstagramSlideshows();
}

// Re-init hooks for Divi Builder and AJAX
document.addEventListener('et_pb_reinit_modules', initInstagramSlideshows);
document.addEventListener('ajaxComplete', initInstagramSlideshows);

if (document.body && 'MutationObserver' in window) {
    const observer = new MutationObserver(initInstagramSlideshows);
    observer.observe(document.body, { childList: true, subtree: true });
}
