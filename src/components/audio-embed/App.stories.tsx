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

// Points at a slug that (most likely) has no generated audio yet, so this
// renders the collapsed / no-visible-gap state -- the whole point of this
// module over the old fixed-height Code embed.
export const NoAudioYet: Story = {
  args: {
    slug: "sachsen-anhalt-nicht-allein",
    audioBaseUrl: DEFAULT_AUDIO_BASE_URL,
  },
};

export const EmptySlug: Story = {
  args: {
    slug: "",
    audioBaseUrl: DEFAULT_AUDIO_BASE_URL,
  },
};
