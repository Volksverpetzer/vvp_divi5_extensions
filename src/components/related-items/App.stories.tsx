import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RelatedItemsApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";
import { TRENDING_ALL, TRENDING_EMPTY } from "../shared/previewFixtures";

const meta: Meta<typeof RelatedItemsApp> = {
  title: "Modules/RelatedItems",
  component: RelatedItemsApp,
  decorators: [(Story) => <PreviewCard>{Story()}</PreviewCard>],
};

export default meta;
type Story = StoryObj<typeof RelatedItemsApp>;

export const ThreeMatches: Story = {
  args: { items: TRENDING_ALL.slice(0, 3) },
};

export const NoMatches: Story = {
  name: "No matches (renders nothing)",
  args: { items: TRENDING_EMPTY },
};
