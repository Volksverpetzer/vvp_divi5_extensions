export type SteadyPlan = {
  /** Monthly amount in euros, shown on the button. */
  amount: number;
  planId: string;
};

// Steady plan IDs are UUIDs. Only these may reach the link's href, so a
// value typed into the module setting can't inject a different URL.
const PLAN_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parses the module's Steady plan setting: one "amount=plan-id" entry per
 * line (";" also separates entries), e.g.
 * "8=7e829883-979d-4200-ba6e-8c0ffbffd151". Not commas: they're the
 * decimal separator in German amounts ("3,50=…").
 * Entries with an invalid amount or plan ID are skipped.
 */
export const parseSteadyPlans = (input: string): SteadyPlan[] =>
  input
    .split(/[\n;]/)
    .map((entry) => entry.split("="))
    .filter((parts) => parts.length === 2)
    .map(([amount, planId]) => ({
      amount: Number(amount.trim().replace(",", ".")),
      planId: planId.trim(),
    }))
    .filter(
      (plan) =>
        Number.isFinite(plan.amount) &&
        plan.amount > 0 &&
        PLAN_ID_PATTERN.test(plan.planId),
    );

/** Link to a Steady plan's checkout. */
export const steadyPlanUrl = (planId: string): string =>
  `https://steady.page/plans/${encodeURIComponent(planId)}`;

/**
 * The Steady plan for the amount selected in the presets, or undefined for a
 * custom amount (Steady plans have fixed amounts) or an amount without a plan.
 */
export const steadyPlanForAmount = (
  plans: SteadyPlan[],
  amount: number,
  isCustomAmount: boolean,
): SteadyPlan | undefined =>
  isCustomAmount ? undefined : plans.find((plan) => plan.amount === amount);

/** "3, 8, 12, 20 oder 30", for the hint under a disabled Steady button. */
export const formatSteadyAmounts = (plans: SteadyPlan[]): string => {
  const amounts = plans.map((plan) => plan.amount.toLocaleString("de-DE"));
  return amounts.length > 1
    ? `${amounts.slice(0, -1).join(", ")} oder ${amounts[amounts.length - 1]}`
    : (amounts[0] ?? "");
};
