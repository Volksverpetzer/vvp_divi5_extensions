import { type ModuleLibrary } from "@divi/types";
import { type SteadyPlan } from "./steady";
import { type Experiment } from "../../utils/experiment";

export interface CampaignDonateAttrs {
  module: object;
  apiBaseUrl: object;
  campaignKey: object;
  donationInterval: object;
  stripePublicKey: object;
  paypalClientId: object;
  presets: object;
  steadyPlans: object;
  certificateUrl: object;
  thankYouUrl: object;
  buttonLabel: object;
  abTestName: object;
  buttonLabelB: object;
}

export type CampaignDonateEditProps =
  ModuleLibrary.Module.Component.EditProps<CampaignDonateAttrs>;

export interface CampaignDonateAppProps {
  apiBaseUrl: string;
  campaignKey: string;
  /**
   * "month" offers a monthly Stripe donation plus the Steady plans and hides
   * PayPal; "once" (default) offers one-time Stripe and PayPal payments.
   */
  interval?: "once" | "month";
  /** Empty string hides the Stripe payment option. */
  stripePublicKey: string;
  /** Empty string hides the PayPal payment option. */
  paypalClientId: string;
  presets: number[];
  /** Shown as links to their Steady checkout in monthly mode only. */
  steadyPlans?: SteadyPlan[];
  certificateUrl?: string;
  /**
   * Page the donor is sent to once a donation is complete, instead of the
   * thank-you notice in the form. Only http(s) or root-relative URLs.
   */
  thankYouUrl?: string;
  /** Text of the Stripe button; defaults to „Mit Karte/SEPA spenden“. */
  buttonLabel?: string;
  /**
   * The A/B test this page view takes part in, if any. Its name and variant
   * are added to every Plausible event of the form.
   */
  experiment?: Experiment;
  /** Builder preview only — skips network calls, form is inert. */
  preview?: boolean;
}

/** Minimal shape of the PayPal JS SDK global we actually use. */
export interface PayPalNamespace {
  Buttons(options: {
    style?: Record<string, unknown>;
    /** Called before the PayPal popup opens; `actions.reject()` cancels it. */
    onClick?: (
      data: unknown,
      actions: { resolve: () => Promise<void>; reject: () => Promise<void> },
    ) => Promise<void> | void;
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
