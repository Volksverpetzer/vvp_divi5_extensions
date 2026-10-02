import { type ModuleLibrary } from "@divi/types";

export interface TrendingItemsAttrs {
  module: object;
  range: object;
  showThumbnail: object;
  headline?: object;
  showHeadline?: object;
}

export type TrendingItemsEditProps =
  ModuleLibrary.Module.Component.EditProps<TrendingItemsAttrs>;
