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

/** Every prop exposed as a control. One-time donation, no certificate (XMAS 2026). */
export const Playground: Story = {
  args: {
    amount: 50,
  },
};

/** After a monthly donation ("Deine monatliche Spende …"), as in monthly mode on /weihnachten. */
export const Monthly: Story = {
  args: {
    amount: 5,
    monthly: true,
  },
};

/** With the ambassador certificate link, as offered in the 2025 Christmas campaign. */
export const WithCertificate: Story = {
  args: {
    amount: 50,
    certificateUrl: "/",
  },
};
