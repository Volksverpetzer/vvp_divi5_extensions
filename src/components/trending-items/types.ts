import { type ModuleLibrary } from "@divi/types";

export interface TrendingItem {
  title: string;
  url: string;
  thumbnailUrl: string;
  type: string;
  pageviews: number;
}

export interface TrendingItemsAttrs {
  module: object;
  contentType: object;
  itemCount: object;
  range: object;
  showThumbnail: object;
}

export type TrendingItemsEditProps =
  ModuleLibrary.Module.RenderProps<TrendingItemsAttrs>;
