import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InstagramSlideshow } from "./InstagramSlideshow";
import { PreviewCard } from "../shared/PreviewCard";
import { IG_PROPS } from "../shared/previewFixtures";

const meta: Meta<typeof InstagramSlideshow> = {
  title: "Modules/ContentOverview/InstagramSlideshow",
  component: InstagramSlideshow,
  decorators: [(Story) => <PreviewCard>{Story()}</PreviewCard>],
};

export default meta;
type Story = StoryObj<typeof InstagramSlideshow>;

/** Every prop exposed as a control. */
export const Playground: Story = {
  args: { ...IG_PROPS, postId: "" },
};

export const BrokenImage: Story = {
  args: {
    ...IG_PROPS,
    slides: [
      { thumb: "https://example.invalid/does-not-exist.jpg", video: "" },
      ...IG_PROPS.slides.slice(1),
    ],
  },
};

/**
 * First slide's image never answers (a non-routable address), like a hanging
 * media proxy: the loading placeholder turns into the fallback after
 * IMAGE_LOAD_TIMEOUT_MS.
 */
export const HangingImage: Story = {
  args: {
    ...IG_PROPS,
    slides: [
      { thumb: "http://10.255.255.1/hangs.jpg", video: "" },
      ...IG_PROPS.slides.slice(1),
    ],
  },
};
