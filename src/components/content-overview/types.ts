// External Dependencies.
import { type ModuleLibrary } from "@divi/types";

// Module attributes interface.
// ContentOverview is mostly a pure SSR module — the module attribute holds
// decoration/layout settings — plus a contentTypes attribute letting editors
// restrict which item kinds the server-rendered feed includes.
export interface ContentOverviewAttrs {
  module: object;
  contentTypes?: object;
}

// Edit component props.
export type ContentOverviewEditProps =
  ModuleLibrary.Module.Component.EditProps<ContentOverviewAttrs>;
