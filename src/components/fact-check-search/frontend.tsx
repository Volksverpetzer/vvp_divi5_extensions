import * as React from 'react';
import { FactCheckSearchApp } from './App';

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

const initAll = () => {
    const mounts = document.querySelectorAll('.vvp-fc__mount:not([data-fc-initialized="true"])');
    mounts.forEach(mount => {
        mount.setAttribute('data-fc-initialized', 'true');
        const searchApiUrl = mount.getAttribute('data-search-url') || '';
        const importApiUrl = mount.getAttribute('data-import-url') || '';
        mountReact(
            <FactCheckSearchApp searchApiUrl={searchApiUrl} importApiUrl={importApiUrl} />,
            mount
        );
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// React to Divi ajax and module re-inits on the frontend
document.addEventListener('et_pb_reinit_modules', initAll);
document.addEventListener('ajaxComplete', initAll);

if (document.body && 'MutationObserver' in window) {
    const observer = new MutationObserver(initAll);
    observer.observe(document.body, { childList: true, subtree: true });
}
