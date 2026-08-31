import { type Metadata, type ModuleLibrary } from "@divi/types";

import metadata from "./module.json";
import { CtaBoxEdit } from "./edit";
import { type CtaBoxAttrs } from "./types";
import { placeholderContent } from "./placeholder-content";

import "./style.css";
import "./module.css";

export const ctaBox: ModuleLibrary.Module.RegisterDefinition<CtaBoxAttrs> = {
  metadata: metadata as Metadata.Values<CtaBoxAttrs>,
  placeholderContent,
  renderers: {
    edit: CtaBoxEdit,
  },
};
