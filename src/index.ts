import { omit } from 'lodash';
import { addAction } from '@wordpress/hooks';
import { registerModule } from '@divi/module-library';

// Import module.
import { factCheckSearch } from './components/fact-check-search';

// Import icons.
import './module-icons';

// Register Faktencheck Search module with DIVI.
addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'vvp/factCheckSearch', () => {
    registerModule(factCheckSearch.metadata, omit(factCheckSearch, 'metadata'));
});
