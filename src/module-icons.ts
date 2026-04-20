import { addFilter } from '@wordpress/hooks';
import * as factCheckSearchIcon from './icons/fact-check-search';
import * as contentOverviewIcon from './icons/content-overview';
import * as authorProfileIcon from './icons/author-profile';

// Add module icons to the icon library.
addFilter('divi.iconLibrary.icon.map', 'vvp/factCheckSearch', (icons) => {
    return {
        ...icons,
        [factCheckSearchIcon.name]: factCheckSearchIcon,
        [contentOverviewIcon.name]: contentOverviewIcon,
        [authorProfileIcon.name]: authorProfileIcon,
    };
});
