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
// mockup rather than a live fetch through showErrorCard, since Storybook
// needs to render this deterministically regardless of what's deployed.
export const ErrorCard: Story = {
  args: {
    slug: "no-audio-yet",
    audioBaseUrl: DEFAULT_AUDIO_BASE_URL,
    errorCard: true,
  },
};

// "no-audio-yet" is a synthetic slug, not a real WordPress post -- and
// that's fine: vvp_wp_audio_converter has no concept of WordPress posts at
// all, it only checks whether a matching mp3 exists in Bunny storage, so
// any slug without one (real article yet to be converted, or no article at
// all) exercises the exact same "not yet available" code path. Renders the
// collapsed / no-visible-gap state -- the whole point of this module over
// the old fixed-height Code embed, and what visitors actually see by
// default (showErrorCard off) -- contrast with ErrorCard above.
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
