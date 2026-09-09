import { type ModuleLibrary } from "@divi/types";

export interface AudioEmbedAttrs {
  module: object;
  audioBaseUrl: object;
}

export type AudioEmbedEditProps =
  ModuleLibrary.Module.Component.EditProps<AudioEmbedAttrs>;

export interface AudioEmbedAppProps {
  slug: string;
  audioBaseUrl: string;
}
