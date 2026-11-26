import { type SteadyPlan } from "./steady";

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
