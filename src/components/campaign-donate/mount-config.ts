import { type SteadyPlan } from "./steady";
import { type Experiment, type Variant } from "../../utils/experiment";

export type MountSettings = {
  apiBaseUrl: string;
  campaignKey: string;
  interval: "once" | "month";
  stripePublicKey: string;
  paypalClientId: string;
  steadyPlans: SteadyPlan[];
};

/**
 * Reduces the configured API base URL to the crowdfunding app's root. The
 * form appends /api/create-checkout-session etc. itself, so an editor who
 * pastes a full endpoint (e.g. the progress module's .../api/campaign-summary)
 * would otherwise produce .../api/campaign-summary/api/create-checkout-session
 * and a 404. Drops trailing slashes and everything from an /api path segment.
 */
export const normalizeApiBaseUrl = (url: string): string =>
  url
    .trim()
    .replace(/\/api(?:[/?#].*)?$/, "")
    .replace(/\/+$/, "");

/**
 * Decides which payment options a mounted form can actually offer, or null
 * when there's nothing to show. Stripe and PayPal both go through the
 * crowdfunding app, so without its API base URL and campaign key they're
 * dropped. Steady plans are plain links and need neither, so a monthly form
 * with only Steady plans still renders.
 */
export const resolveMountSettings = (
  settings: MountSettings,
): MountSettings | null => {
  const apiBaseUrl = normalizeApiBaseUrl(settings.apiBaseUrl);
  const apiConfigured = Boolean(apiBaseUrl && settings.campaignKey);
  const monthly = settings.interval === "month";

  const resolved: MountSettings = {
    ...settings,
    apiBaseUrl,
    stripePublicKey: apiConfigured ? settings.stripePublicKey : "",
    // PayPal only does one-time payments here.
    paypalClientId: apiConfigured && !monthly ? settings.paypalClientId : "",
    steadyPlans: monthly ? settings.steadyPlans : [],
  };

  const hasPaymentOption =
    Boolean(resolved.stripePublicKey) ||
    Boolean(resolved.paypalClientId) ||
    resolved.steadyPlans.length > 0;

  return hasPaymentOption ? resolved : null;
};

/**
 * Return-URL parameter carrying the A/B variant a Stripe checkout started
 * under, so the page view after a redirect-based payment keeps it.
 */
export const EXPERIMENT_RETURN_PARAM = "vvp_cd_ab";

export const DEFAULT_STRIPE_BUTTON_LABEL = "Mit Karte/SEPA spenden";

export type ButtonLabelSettings = {
  /** „Button-Text (optional)“; empty means the default label. */
  buttonLabel: string;
  /** „A/B-Test: Name“; empty means no test. */
  testName: string;
  /** „A/B-Test: Button-Text Variante B“; empty means no test. */
  buttonLabelB: string;
  /** Whether the form has a Stripe button at all (the label is its text). */
  hasStripe: boolean;
};

/**
 * Decides the Stripe button's label and, if an A/B test is configured, which
 * variant this page view takes part in. A test runs only with both a name and
 * a variant B label, and only when there is a Stripe button to test (the
 * PayPal buttons are drawn by PayPal's SDK, their text can't be changed).
 * Variant A is the regular label, so the test compares B against it.
 */
export const resolveButtonLabel = (
  settings: ButtonLabelSettings,
  pick: (name: string) => Variant,
): { buttonLabel: string; experiment?: Experiment } => {
  const labelA = settings.buttonLabel.trim() || DEFAULT_STRIPE_BUTTON_LABEL;
  const name = settings.testName.trim();
  const labelB = settings.buttonLabelB.trim();
  if (!name || !labelB || !settings.hasStripe) {
    return { buttonLabel: labelA };
  }
  const variant = pick(name);
  return {
    buttonLabel: variant === "B" ? labelB : labelA,
    experiment: { name, variant },
  };
};
