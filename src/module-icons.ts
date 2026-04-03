import { addFilter } from '@wordpress/hooks';
import * as factCheckSearchIcon from './icons/fact-check-search';

// Add module icons to the icon library.
addFilter('divi.iconLibrary.icon.map', 'vvp/factCheckSearch', (icons) => {
    return {
        ...icons,
        [factCheckSearchIcon.name]: factCheckSearchIcon,
    };
});
