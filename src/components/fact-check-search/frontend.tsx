import * as React from 'react';
import { FactCheckSearchApp } from './App';

const initAll = () => {
    const mounts = document.querySelectorAll('.vvp-fc__mount:not([data-fc-initialized="true"])');
    mounts.forEach(mount => {
        mount.setAttribute('data-fc-initialized', 'true');
        const searchApiUrl = mount.getAttribute('data-search-url') || '';
        const importApiUrl = mount.getAttribute('data-import-url') || '';
        
        // Dynamically resolve render to bypass Webpack external wrapper issues
        // @ts-ignore
        const renderFunc = (window.wp && window.wp.element && window.wp.element.render)
            // @ts-ignore 
            || (window.ReactDOM && window.ReactDOM.render);
            
        if (renderFunc) {
            renderFunc(
                <FactCheckSearchApp searchApiUrl={searchApiUrl} importApiUrl={importApiUrl} />,
                mount
            );
        } else {
            console.error("React render function not found globally.");
        }
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
