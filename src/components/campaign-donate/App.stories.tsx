import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CampaignDonateApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";

const meta: Meta<typeof CampaignDonateApp> = {
  title: "Modules/CampaignDonate/Form",
  component: CampaignDonateApp,
  decorators: [
    (Story) => (
      <PreviewCard moduleClass="vvp-campaign-donate">{Story()}</PreviewCard>
    ),
  ],
  argTypes: {
    preview: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof CampaignDonateApp>;

/**
 * Every prop exposed as a control. One-time mode as on /weihnachten
 * (XMAS 2026): Stripe + PayPal, no certificate.
 */
export const Playground: Story = {
  args: {
    apiBaseUrl: "https://crowdfunding.volksverpetzer.de",
    campaignKey: "xmas2026",
    interval: "once",
    stripePublicKey: "pk_test_51234567890",
    paypalClientId: "AWJvLVwI_example",
    presets: [10, 50, 100],
    preview: true,
  },
};

export const StripeOnly: Story = {
  args: {
    ...Playground.args,
    stripePublicKey: "pk_test_01234567890",
    paypalClientId: "",
  },
};

/**
 * Monthly mode as on /weihnachten (XMAS 2026): Stripe subscription plus one
 * button per Steady plan; PayPal is hidden.
 */
export const Monthly: Story = {
  args: {
    apiBaseUrl: "https://crowdfunding.volksverpetzer.de",
    campaignKey: "xmas2026",
    interval: "month",
    stripePublicKey: "pk_test_51234567890",
    paypalClientId: "AWJvLVwI_example",
    presets: [3, 5, 10, 25],
    steadyPlans: [
      { amount: 3, planId: "955a79f3-ef31-4fc3-b196-2e634ed29f20" },
      { amount: 5, planId: "a5fcfc59-8848-4359-9b03-585cfedb54b5" },
      { amount: 10, planId: "a9ba3756-2501-4838-b157-04b9abca1635" },
      { amount: 25, planId: "eb744a98-4ae8-496b-848d-e4c090611bc8" },
    ],
    preview: true,
  },
};

/** Monthly mode with Steady only (no Stripe key): no amount picker. */
export const MonthlySteadyOnly: Story = {
  args: {
    ...Monthly.args,
    stripePublicKey: "",
  },
};
