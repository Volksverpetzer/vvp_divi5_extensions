import { registerIconLibrary } from '@divi/icon-library';
import { InstagramSlideshowIcon } from './instagram-slideshow';

export const moduleIcons = {
    'vvp/instagram-slideshow-icon': InstagramSlideshowIcon,
};

// Register icons with DIVI.
Object.entries(moduleIcons).forEach(([name, component]) => {
    registerIconLibrary(name, component);
});
