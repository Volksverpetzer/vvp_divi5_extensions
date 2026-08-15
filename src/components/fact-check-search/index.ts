// Divi dependencies.
import { type Metadata, type ModuleLibrary } from "@divi/types";

// Local dependencies.
import metadata from "./module.json";
import { FactCheckSearchEdit } from "./edit";
import { FactCheckSearchAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

// Styles.
import "./style.css";
import "./module.css";

export const factCheckSearch: ModuleLibrary.Module.RegisterDefinition<FactCheckSearchAttrs> =
  {
    // Imported json has no inferred type hence type-cast is necessary.
    metadata: metadata as Metadata.Values<FactCheckSearchAttrs>,
    placeholderContent,
    renderers: {
      edit: FactCheckSearchEdit,
    },
  };
