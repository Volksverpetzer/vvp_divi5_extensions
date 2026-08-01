import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CampaignDonateApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";

const meta: Meta<typeof CampaignDonateApp> = {
  title: "Modules/CampaignDonate",
  component: CampaignDonateApp,
  decorators: [
    (Story) => (
      <PreviewCard moduleClass="vvp-campaign-donate">{Story()}</PreviewCard>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CampaignDonateApp>;

export const StripeAndPayPal: Story = {
  name: "Stripe + PayPal (with presets)",
  args: {
    apiBaseUrl: "https://crowdfunding.volksverpetzer.de",
    campaignKey: "flyer2026",
    stripePublicKey: "pk_test_51234567890",
    paypalClientId: "AWJvLVwI_example",
    presets: [10, 50, 100],
    certificateUrl: "/",
    preview: true,
  },
};

export const StripeOnly: Story = {
  args: {
    apiBaseUrl: "https://crowdfunding.volksverpetzer.de",
    campaignKey: "flyer2026",
    stripePublicKey: "pk_test_01234567890",
    paypalClientId: "",
    presets: [15, 30, 75, 150],
    certificateUrl: "/",
    preview: true,
  },
};
