import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { RelatedItemsEdit } from "./edit";
import { type RelatedItemsAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./style.css";
import "./module.css";

export const relatedItems: ModuleLibrary.Module.RegisterDefinition<RelatedItemsAttrs> =
  {
    metadata: metadata as Metadata.Values<RelatedItemsAttrs>,
    placeholderContent,
    renderers: {
      edit: RelatedItemsEdit,
    },
  };
