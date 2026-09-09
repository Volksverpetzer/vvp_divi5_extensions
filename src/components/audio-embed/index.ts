import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { AudioEmbedEdit } from "./edit";
import { type AudioEmbedAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./style.css";
import "./module.css";

export const audioEmbed: ModuleLibrary.Module.RegisterDefinition<AudioEmbedAttrs> =
  {
    metadata: metadata as Metadata.Values<AudioEmbedAttrs>,
    placeholderContent,
    renderers: {
      edit: AudioEmbedEdit,
    },
  };
