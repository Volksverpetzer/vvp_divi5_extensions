import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { FactCheckSearchApp } from './App';

const initAll = () => {
    const mounts = document.querySelectorAll('.vvp-fc__mount:not([data-fc-initialized="true"])');
    mounts.forEach(mount => {
        mount.setAttribute('data-fc-initialized', 'true');
        const searchApiUrl = mount.getAttribute('data-search-url') || '';
        const importApiUrl = mount.getAttribute('data-import-url') || '';
        createRoot(mount).render(
            <FactCheckSearchApp searchApiUrl={searchApiUrl} importApiUrl={importApiUrl} />
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
