import React from 'react';
import ReactDOM from 'react-dom';
import { InstagramSlideshowEdit } from '../src/components/instagram-slideshow/edit';
import '../src/components/instagram-slideshow/style.scss';

const app = document.querySelector('#app');

const elements = {
    styleComponents: () => null,
};

const attrs = {
    postId: { desktop: { value: '17881655640351114' } },
    apiBaseUrl: { desktop: { value: 'https://volksverpetzer-app.de/proxy/instaById/' } },
    showCaption: { desktop: { value: 'on' } },
    showNavigation: { desktop: { value: 'on' } },
    showPagination: { desktop: { value: 'on' } },
    autoplay: { desktop: { value: 'on' } },
    transitionSpeed: { desktop: { value: '3' } },
};

if (app) {
    ReactDOM.render(
        <InstagramSlideshowEdit
            attrs={attrs as any}
            elements={elements as any}
            id="preview-instagram-slideshow"
            name="vvp/instagram-slideshow"
        />,
        app
    );
}
