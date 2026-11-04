import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CampaignDonateThanks } from "./App";
import { PreviewCard } from "../shared/PreviewCard";

const meta: Meta<typeof CampaignDonateThanks> = {
  title: "Modules/CampaignDonate/Thanks",
  component: CampaignDonateThanks,
  decorators: [
    (Story) => (
      <PreviewCard moduleClass="vvp-campaign-donate">{Story()}</PreviewCard>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CampaignDonateThanks>;

/** Every prop exposed as a control. */
export const Playground: Story = {
  args: {
    amount: 50,
    certificateUrl: "/",
  },
};
