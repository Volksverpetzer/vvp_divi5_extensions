import { type ModuleLibrary } from "@divi/types";

export interface CampaignDonateAttrs {
  module: object;
  apiBaseUrl: object;
  campaignKey: object;
  stripePublicKey: object;
  presets: object;
  certificateUrl: object;
}

export type CampaignDonateEditProps =
  ModuleLibrary.Module.Component.EditProps<CampaignDonateAttrs>;

export interface CampaignDonateAppProps {
  apiBaseUrl: string;
  campaignKey: string;
  stripePublicKey: string;
  presets: number[];
  certificateUrl?: string;
  /** Builder preview only — skips network calls, form is inert. */
  preview?: boolean;
}
