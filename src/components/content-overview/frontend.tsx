import * as React from 'react';
import { InstagramSlideshow } from './InstagramSlideshow';

const initInstagramSlideshows = () => {
    const mounts = document.querySelectorAll('.vvp-co-ig-mount:not([data-ig-initialized="true"])');
    mounts.forEach((mount) => {
        mount.setAttribute('data-ig-initialized', 'true');
                const rawProps = mount.getAttribute('data-ig-props');
        if (rawProps) {
            try {
                const props = JSON.parse(rawProps);
                // Dynamically resolve render to bypass Webpack external function wrapper issues
                // @ts-ignore
                const renderFunc = (window.wp && window.wp.element && window.wp.element.render) 
                    // @ts-ignore
                    || (window.ReactDOM && window.ReactDOM.render);
                    
                if (renderFunc) {
                    renderFunc(<InstagramSlideshow {...props} />, mount);
                } else {
                    console.error("React render function not found globally.");
                }
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
