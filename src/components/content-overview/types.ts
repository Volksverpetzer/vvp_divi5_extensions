// External Dependencies.
import { type ModuleLibrary } from "@divi/types";

// Module attributes interface.
// ContentOverview is mostly a pure SSR module — the module attribute holds
// decoration/layout settings — plus a handful of attributes letting editors
// tune the server-rendered feed (which item kinds appear, how many, headline
// text) without touching PHP.
export interface ContentOverviewAttrs {
  module: object;
  contentTypes?: object;
  itemsToShow?: object;
  showLoadMore?: object;
  headline?: object;
  showHeadline?: object;
}

// Edit component props.
export type ContentOverviewEditProps =
  ModuleLibrary.Module.Component.EditProps<ContentOverviewAttrs>;
