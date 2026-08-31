import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InstagramSlideshow } from "./InstagramSlideshow";
import { PreviewCard } from "../shared/PreviewCard";
import { IG_PROPS } from "../shared/previewFixtures";

const meta: Meta<typeof InstagramSlideshow> = {
  title: "Modules/ContentOverview/InstagramSlideshow",
  component: InstagramSlideshow,
  decorators: [(Story) => <PreviewCard maxWidth={360}>{Story()}</PreviewCard>],
};

export default meta;
type Story = StoryObj<typeof InstagramSlideshow>;

export const Default: Story = {
  args: IG_PROPS,
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
