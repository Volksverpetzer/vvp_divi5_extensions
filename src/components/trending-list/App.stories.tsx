import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrendingListApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";
import { TRENDING_LIST_ITEMS } from "../shared/previewFixtures";

const meta: Meta<typeof TrendingListApp> = {
  title: "Modules/TrendingList",
  component: TrendingListApp,
  decorators: [
    (Story) => (
      <PreviewCard moduleClass="vvp-trending-list">{Story()}</PreviewCard>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TrendingListApp>;

export const ThreeEntries: Story = {
  args: { items: TRENDING_LIST_ITEMS },
};

export const Empty: Story = {
  args: { items: [] },
};
