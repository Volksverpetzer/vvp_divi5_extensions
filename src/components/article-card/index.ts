import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { ArticleCardEdit } from "./edit";
import { type ArticleCardAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./module.css";

export const articleCard: ModuleLibrary.Module.RegisterDefinition<ArticleCardAttrs> =
  {
    metadata: metadata as Metadata.Values<ArticleCardAttrs>,
    placeholderContent,
    renderers: {
      edit: ArticleCardEdit,
    },
  };
