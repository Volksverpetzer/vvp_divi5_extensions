// Divi dependencies.
import {
    type Metadata,
    type ModuleLibrary,
} from '@divi/types';

// Local dependencies.
import metadata from './module.json';
import { InstagramSlideshowEdit } from './edit';
import { InstagramSlideshowAttrs } from './types';
import { placeholderContent } from './placeholder-content';

// Styles.
import './style.scss';
import './module.scss';

export const instagramSlideshow: ModuleLibrary.Module.RegisterDefinition<InstagramSlideshowAttrs> = {
    // Imported json has no inferred type hence type-cast is necessary.
    metadata: metadata as Metadata.Values<InstagramSlideshowAttrs>,
    placeholderContent,
    renderers: {
        edit: InstagramSlideshowEdit,
    },
};
