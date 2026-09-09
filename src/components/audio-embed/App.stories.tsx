import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AudioEmbedApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";
import { DEFAULT_AUDIO_BASE_URL } from "./constants";

const meta: Meta<typeof AudioEmbedApp> = {
  title: "Modules/AudioEmbed",
  component: AudioEmbedApp,
  decorators: [(Story) => <PreviewCard>{Story()}</PreviewCard>],
};

export default meta;
type Story = StoryObj<typeof AudioEmbedApp>;

// A real slug with a real generated audio file -- the live embed actually
// resizes to the player's real height via postMessage. Confirmed against
// the live deploy; if this slug's audio ever gets taken down, swap in
// another one from https://audio.volksverpetzer-app.de.
export const Valid: Story = {
  args: {
    slug: "bka-anschlag-halle-vergessen",
    audioBaseUrl: DEFAULT_AUDIO_BASE_URL,
  },
};

// What editors see in the Divi Visual Builder: no real article slug exists
// there, so this renders a static mockup instead of attempting a live
// iframe against a fake slug (which used to just look empty). Always
// shown regardless of the "Fehlerkarte anzeigen" setting -- editors only
// ever see this placeholder, never the real error card.
export const Placeholder: Story = {
  args: {
    slug: "",
    audioBaseUrl: "",
    preview: true,
  },
};

// The *visible* error card vvp_wp_audio_converter renders for a site
// visitor when "Fehlerkarte anzeigen" is on and this article has no audio
// yet (ordinarily nothing renders at all -- see NoAudioYet below). Static
// mockup, not a live fetch: showErrorCard only takes effect once
// vvp_wp_audio_converter#44 is deployed, and Storybook needs to render
// deterministically regardless.
export const ErrorCard: Story = {
  args: {
    slug: "no-audio-yet",
    audioBaseUrl: DEFAULT_AUDIO_BASE_URL,
    errorCard: true,
  },
};

// Points at a slug that (most likely) has no generated audio yet, so this
// renders the collapsed / no-visible-gap state -- the whole point of this
// module over the old fixed-height Code embed. This is what visitors
// actually see by default (showErrorCard off) when an article has no
// audio -- contrast with ErrorCard above.
export const NoAudioYet: Story = {
  args: {
    slug: "no-audio-yet",
    audioBaseUrl: DEFAULT_AUDIO_BASE_URL,
  },
};

export const EmptySlug: Story = {
  args: {
    slug: "",
    audioBaseUrl: DEFAULT_AUDIO_BASE_URL,
  },
};
