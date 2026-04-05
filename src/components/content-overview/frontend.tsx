import * as React from 'react';
import { InstagramSlideshow } from './InstagramSlideshow';

// @ts-ignore
const wpEl = () => window.wp && window.wp.element;
// @ts-ignore
const rdOM = () => window.ReactDOM;

const mountReact = (component: React.ReactElement, container: Element) => {
    if (wpEl()?.createRoot) {
        wpEl().createRoot(container).render(component);
    } else if (rdOM()?.createRoot) {
        rdOM().createRoot(container).render(component);
    } else if (wpEl()?.render) {
        wpEl().render(component, container);
    } else if (rdOM()?.render) {
        rdOM().render(component, container);
    } else {
        console.error("React render function not found globally.");
    }
};

const initInstagramSlideshows = () => {
    const mounts = document.querySelectorAll('.vvp-co-ig-mount:not([data-ig-initialized="true"])');
    mounts.forEach((mount) => {
        mount.setAttribute('data-ig-initialized', 'true');
        const rawProps = mount.getAttribute('data-ig-props');
        if (rawProps) {
            try {
                const props = JSON.parse(rawProps);
                mountReact(<InstagramSlideshow {...props} />, mount);
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
