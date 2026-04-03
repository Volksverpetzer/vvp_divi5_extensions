import React from 'react';
import ReactDOM from 'react-dom';
import { FactCheckSearchEdit } from '../src/components/fact-check-search/edit';
import '../src/components/fact-check-search/style.scss';

const app = document.querySelector('#app');

const elements = {
    styleComponents: () => null,
};

const attrs = {
    searchApiUrl: { desktop: { value: '' } },
    importApiUrl: { desktop: { value: '' } },
};

if (app) {
    ReactDOM.render(
        <FactCheckSearchEdit
            attrs={attrs as any}
            elements={elements as any}
            id="preview-fact-check-search"
            name="vvp/fact-check-search"
        />,
        app
    );
}
