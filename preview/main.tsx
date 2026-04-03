import React from 'react';
import ReactDOM from 'react-dom';
import { FactCheckBar } from './SearchComponent';
import '../src/components/fact-check-search/style.scss';

const app = document.querySelector('#app');

if (app) {
    ReactDOM.render(
        <FactCheckBar />,
        app
    );
}
