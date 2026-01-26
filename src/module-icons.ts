import { addFilter } from '@wordpress/hooks';
import * as instagramSlideshowIcon from './icons/instagram-slideshow';

// Add module icons to the icon library.
addFilter('divi.iconLibrary.icon.map', 'vvp/instagramSlideshow', (icons) => {
    return {
        ...icons,
        [instagramSlideshowIcon.name]: instagramSlideshowIcon,
    };
});
