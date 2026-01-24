import { omit } from 'lodash';
import { addAction } from '@wordpress/hooks';
import { registerModule } from '@divi/module-library';

// Import module.
import { instagramSlideshow } from './components/instagram-slideshow';

// Import icons.
import './module-icons';

// Register Instagram Slideshow module with DIVI.
addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'vvp/instagramSlideshow', () => {
    registerModule(instagramSlideshow.metadata, omit(instagramSlideshow, 'metadata'));
});
