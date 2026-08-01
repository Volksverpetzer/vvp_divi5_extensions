import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CampaignProgressApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";

const meta: Meta<typeof CampaignProgressApp> = {
  title: "Modules/CampaignProgress",
  component: CampaignProgressApp,
  decorators: [
    (Story) => (
      <PreviewCard moduleClass="vvp-campaign-progress">{Story()}</PreviewCard>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CampaignProgressApp>;

export const Default: Story = {
  args: { total: 62340, goal: 100000 },
};

export const GoalReached: Story = {
  args: { total: 104500, goal: 100000 },
};
