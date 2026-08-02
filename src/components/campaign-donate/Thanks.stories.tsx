import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CampaignDonateThanks } from "./App";
import { PreviewCard } from "../shared/PreviewCard";

const meta: Meta<typeof CampaignDonateThanks> = {
  title: "Modules/CampaignDonate",
  component: CampaignDonateThanks,
  decorators: [
    (Story) => (
      <PreviewCard moduleClass="vvp-campaign-donate">{Story()}</PreviewCard>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CampaignDonateThanks>;

export const Success: Story = {
  name: "Success (donation complete)",
  args: {
    amount: 50,
    certificateUrl: "/",
  },
};
