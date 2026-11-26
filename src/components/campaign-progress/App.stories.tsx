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

/**
 * Every prop exposed as a control. Setting `apiUrl` makes the component
 * fetch and poll that URL itself.
 */
export const Playground: Story = {
  // XMAS 2026: goal 20.000 € (crowdfunding app, campaign xmas2026).
  args: { total: 7340, goal: 20000, goalOverride: undefined, apiUrl: "" },
  argTypes: {
    goalOverride: { control: "number" },
    apiUrl: { control: "text" },
  },
};

/** With a headline whose placeholders follow the bar's amounts. */
export const WithHeadline: Story = {
  args: {
    total: 7340,
    goal: 20000,
    headline: "Schon {gesammelt} von {ziel} gesammelt!",
  },
};

export const GoalReached: Story = {
  args: { total: 21450, goal: 20000 },
};
