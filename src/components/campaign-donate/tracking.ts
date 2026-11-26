import { trackEvent } from "../../utils/plausible";

export type DonateEventProps = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Plausible props must be strings; undefined/null values are dropped.
 * Exported for tests.
 */
export const toPlausibleProps = (
  props: DonateEventProps,
): Record<string, string> | undefined => {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    normalized[key] = String(value);
  }
  return Object.keys(normalized).length ? normalized : undefined;
};

/**
 * Sends a Spenden-Formular event to Plausible (volksverpetzer.de's script).
 * Event names match the crowdfunding app's (crowdfunding.volksverpetzer.de),
 * so both can be compared with the same goals. Every event carries the
 * campaign key and the interval of the form.
 */
export const trackDonateEvent = (
  event: string,
  base: { campaign: string; interval: "once" | "month" },
  props: DonateEventProps = {},
): void => {
  trackEvent(event, toPlausibleProps({ ...base, ...props }));
};
