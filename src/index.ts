import { omit } from 'lodash';
import { addAction } from '@wordpress/hooks';
import { registerModule } from '@divi/module-library';

// Import modules.
import { factCheckSearch } from './components/fact-check-search';
import { contentOverview } from './components/content-overview';

// Import icons.
import './module-icons';

// Register Faktencheck Search module with DIVI.
addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'vvp/factCheckSearch', () => {
    registerModule(factCheckSearch.metadata, omit(factCheckSearch, 'metadata'));
});

// Register Content Overview module with DIVI.
addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'vvp/contentOverview', () => {
    registerModule(contentOverview.metadata, omit(contentOverview, 'metadata'));
});
