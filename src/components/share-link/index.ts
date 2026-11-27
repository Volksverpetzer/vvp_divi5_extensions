import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { ShareLinkEdit } from "./edit";
import { type ShareLinkAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./style.css";
import "./module.css";

export const shareLink: ModuleLibrary.Module.RegisterDefinition<ShareLinkAttrs> =
  {
    metadata: metadata as Metadata.Values<ShareLinkAttrs>,
    placeholderContent,
    renderers: {
      edit: ShareLinkEdit,
    },
  };
