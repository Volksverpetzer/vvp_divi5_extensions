import { type ModuleLibrary } from "@divi/types";

export interface CampaignDonateAttrs {
  module: object;
  apiBaseUrl: object;
  campaignKey: object;
  stripePublicKey: object;
  paypalClientId: object;
  presets: object;
  certificateUrl: object;
}

export type CampaignDonateEditProps =
  ModuleLibrary.Module.Component.EditProps<CampaignDonateAttrs>;

export interface CampaignDonateAppProps {
  apiBaseUrl: string;
  campaignKey: string;
  /** Empty string hides the Stripe payment option. */
  stripePublicKey: string;
  /** Empty string hides the PayPal payment option. */
  paypalClientId: string;
  presets: number[];
  certificateUrl?: string;
  /** Builder preview only — skips network calls, form is inert. */
  preview?: boolean;
}

/** Minimal shape of the PayPal JS SDK global we actually use. */
export interface PayPalNamespace {
  Buttons(options: {
    style?: Record<string, unknown>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onError?: (err: unknown) => void;
  }): {
    render(container: HTMLElement | string): Promise<void>;
    close?: () => Promise<void>;
  };
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}
