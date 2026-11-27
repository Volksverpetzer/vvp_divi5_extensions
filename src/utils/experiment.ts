/**
 * Client-side A/B tests without any browser storage.
 *
 * The variant is picked in the browser, not in PHP, because pages are
 * cached: a server-side pick would be baked into the cached HTML and every
 * visitor would get the same variant. Nothing is stored on the device (no
 * cookie, no localStorage), so the test needs no consent banner; the unit of
 * the test is the page view. A returning visitor can see the other variant on
 * their next visit, which is fine for small changes such as a button label.
 *
 * Within one page view, every form taking part in the same test gets the
 * same variant (kept in memory only), so two forms on one page don't show
 * both labels at once.
 */

export type Variant = "A" | "B";

export interface Experiment {
  /** Name of the test, sent to Plausible as the `experiment` prop. */
  name: string;
  /** Variant shown in this page view, sent as the `variant` prop. */
  variant: Variant;
}

const pageViewAssignments = new Map<string, Variant>();

/**
 * Picks variant A or B, 50/50, once per test name and page view.
 * `assignments` and `random` are only passed by tests.
 */
export const assignVariant = (
  name: string,
  assignments: Map<string, Variant> = pageViewAssignments,
  random: () => number = Math.random,
): Variant => {
  const existing = assignments.get(name);
  if (existing) return existing;
  const variant: Variant = random() < 0.5 ? "A" : "B";
  assignments.set(name, variant);
  return variant;
};
