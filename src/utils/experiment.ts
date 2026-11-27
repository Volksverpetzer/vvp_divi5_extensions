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
 *
 * A page view that continues one that started earlier (e.g. the return from a
 * payment page) can carry the earlier variant in its URL; see
 * `experimentToParam` / `variantFromParam`. A URL parameter isn't stored on
 * the device either.
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
 * Picks variant A or B, 50/50, once per test name and page view. With
 * `carried` (the variant this page view continues), that one is used instead
 * of a random pick, unless the test already has a variant in this page view.
 * `assignments` and `random` are only passed by tests.
 */
export const assignVariant = (
  name: string,
  carried?: Variant,
  assignments: Map<string, Variant> = pageViewAssignments,
  random: () => number = Math.random,
): Variant => {
  const existing = assignments.get(name);
  if (existing) return existing;
  const variant: Variant = carried ?? (random() < 0.5 ? "A" : "B");
  assignments.set(name, variant);
  return variant;
};

/** URL parameter value for carrying an experiment into a later page view. */
export const experimentToParam = (experiment: Experiment): string =>
  `${experiment.name}:${experiment.variant}`;

/**
 * The variant of test `name` in a parameter value from `experimentToParam`,
 * or undefined when the value is missing, malformed or for another test.
 */
export const variantFromParam = (
  value: string | null,
  name: string,
): Variant | undefined => {
  if (!value) return undefined;
  const separator = value.lastIndexOf(":");
  if (separator < 0 || value.slice(0, separator) !== name) return undefined;
  const variant = value.slice(separator + 1);
  return variant === "A" || variant === "B" ? variant : undefined;
};
