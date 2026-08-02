import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrendingItemsApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";
import {
  TRENDING_ALL,
  TRENDING_PODCAST,
  TRENDING_EMPTY,
} from "../shared/previewFixtures";

const meta: Meta<typeof TrendingItemsApp> = {
  title: "Modules/TrendingItems",
  component: TrendingItemsApp,
  decorators: [
    (Story) => (
      <PreviewCard moduleClass="vvp-trending-items">{Story()}</PreviewCard>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TrendingItemsApp>;

export const WithThumbnails: Story = {
  args: { items: TRENDING_ALL },
};

export const WithoutThumbnails: Story = {
  args: {
    items: TRENDING_ALL.map(({ image_url: _image_url, ...rest }) => rest),
  },
};

export const PodcastFilter: Story = {
  name: "Podcast (URL filter, 1 match)",
  args: { items: TRENDING_PODCAST },
};

export const Empty: Story = {
  args: { items: TRENDING_EMPTY },
};
