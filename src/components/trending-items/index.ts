import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { TrendingItemsEdit } from "./edit";
import { type TrendingItemsAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./style.css";
import "./module.css";

export const trendingItems: ModuleLibrary.Module.RegisterDefinition<TrendingItemsAttrs> =
  {
    metadata: metadata as Metadata.Values<TrendingItemsAttrs>,
    placeholderContent,
    renderers: {
      edit: TrendingItemsEdit,
    },
  };
