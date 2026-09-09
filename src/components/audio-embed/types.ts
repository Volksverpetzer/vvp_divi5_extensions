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
  // When true, skip the real iframe/network entirely and render a static
  // mockup instead -- used by edit.tsx, since no real article slug exists
  // while editing a shared Theme Builder template (see App.tsx).
  preview?: boolean;
}
