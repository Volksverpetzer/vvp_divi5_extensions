// Divi dependencies.
import {
    type Metadata,
    type ModuleLibrary,
} from '@divi/types';

// Local dependencies.
import metadata from './module.json';
import { ContentOverviewEdit } from './edit';
import { ContentOverviewAttrs } from './types';
import { placeholderContent } from './placeholder-content';

// Styles.
import './style.scss';
import './module.scss';

export const contentOverview: ModuleLibrary.Module.RegisterDefinition<ContentOverviewAttrs> = {
    // Imported json has no inferred type hence type-cast is necessary.
    metadata: metadata as Metadata.Values<ContentOverviewAttrs>,
    placeholderContent,
    renderers: {
        edit: ContentOverviewEdit,
    },
};
