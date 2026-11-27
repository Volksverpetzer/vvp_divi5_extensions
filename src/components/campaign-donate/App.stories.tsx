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
 * Monthly mode as on /weihnachten (XMAS 2026): Stripe subscription and one
 * Steady button for the selected amount; PayPal is hidden. The presets match
 * the Steady plans, so Steady is disabled only for a custom amount.
 */
export const Monthly: Story = {
  args: {
    apiBaseUrl: "https://crowdfunding.volksverpetzer.de",
    campaignKey: "xmas2026",
    interval: "month",
    stripePublicKey: "pk_test_51234567890",
    paypalClientId: "AWJvLVwI_example",
    presets: [3, 8, 12, 20, 30],
    steadyPlans: [
      { amount: 3, planId: "48fdfe83-af8b-462e-a56a-c4cfe647261f" },
      { amount: 8, planId: "7e829883-979d-4200-ba6e-8c0ffbffd151" },
      { amount: 12, planId: "01765082-40b1-4244-bbe6-f5311e99df7b" },
      { amount: 20, planId: "c3fd548d-de5c-4994-a454-95577647d346" },
      { amount: 30, planId: "7c881bbc-9c8f-46da-a0c4-2f36140ea446" },
    ],
    preview: true,
  },
};

/**
 * A preset without a Steady plan (here 50 €, selected by default as the
 * second preset): the Steady button is disabled and says which amounts work.
 */
export const MonthlyPresetWithoutSteadyPlan: Story = {
  args: {
    ...Monthly.args,
    presets: [3, 50, 8],
  },
};

/** Monthly mode with Steady only (no Stripe key): presets, no custom amount. */
export const MonthlySteadyOnly: Story = {
  args: {
    ...Monthly.args,
    stripePublicKey: "",
  },
};

/**
 * A/B test on the Stripe button's label, as seen in variant B. On the live
 * page the variant is picked per page view in frontend.tsx; the Visual
 * Builder preview always shows variant A, the regular label.
 */
export const ButtonLabelVariantB: Story = {
  args: {
    ...Playground.args,
    buttonLabel: "Jetzt helfen",
    experiment: { name: "button-xmas2026", variant: "B" },
  },
};
