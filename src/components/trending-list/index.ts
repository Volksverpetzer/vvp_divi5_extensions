import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { TrendingListEdit } from "./edit";
import { type TrendingListAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./style.css";
import "./module.css";

export const trendingList: ModuleLibrary.Module.RegisterDefinition<TrendingListAttrs> =
  {
    metadata: metadata as Metadata.Values<TrendingListAttrs>,
    placeholderContent,
    renderers: {
      edit: TrendingListEdit,
    },
  };
