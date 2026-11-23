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
 * "5=a5fcfc59-8848-4359-9b03-585cfedb54b5". Not commas: they're the
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

/** Link to a Steady plan's checkout, e.g. for a hidden campaign plan. */
export const steadyPlanUrl = (planId: string): string =>
  `https://steady.page/plans/${encodeURIComponent(planId)}`;
