import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { AuthorProfileEdit } from "./edit";
import { type AuthorProfileAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./style.css";
import "./module.css";

export const authorProfile: ModuleLibrary.Module.RegisterDefinition<AuthorProfileAttrs> =
  {
    metadata: metadata as Metadata.Values<AuthorProfileAttrs>,
    placeholderContent,
    renderers: {
      edit: AuthorProfileEdit,
    },
  };
