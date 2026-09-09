import { type ModuleLibrary } from "@divi/types";

export interface AudioEmbedAttrs {
  module: object;
  audioBaseUrl: object;
  showErrorCard: object;
}

export type AudioEmbedEditProps =
  ModuleLibrary.Module.Component.EditProps<AudioEmbedAttrs>;

export interface AudioEmbedAppProps {
  slug: string;
  audioBaseUrl: string;
  // When true, ask vvp_wp_audio_converter to show its visible "Audio
  // nicht verfügbar" card (via a ?showError=1 query param) instead of
  // silently collapsing when this article has no audio yet. Off by
  // default -- this is the real Divi "Fehlerkarte anzeigen" setting.
  showErrorCard?: boolean;
  // When true, skip the real iframe/network entirely and render a static
  // mockup instead -- used by edit.tsx, since no real article slug exists
  // while editing a shared Theme Builder template (see App.tsx).
  preview?: boolean;
  // Storybook-only: render a static mockup of the *visible* error card
  // instead of the real iframe, so that state can be demonstrated without
  // depending on a live cross-origin fetch honoring showErrorCard.
  errorCard?: boolean;
}
