// External Dependencies.
import { type ModuleLibrary } from '@divi/types';

// Module attributes interface.
// ContentOverview is a pure SSR module — no custom content attributes needed
// in the Visual Builder; the module attribute holds decoration/layout settings.
export interface ContentOverviewAttrs {
    module: object;
}

// Edit component props.
export type ContentOverviewEditProps = ModuleLibrary.Module.RenderProps<ContentOverviewAttrs>;
