/** The part of the crowdfunding app's /api/campaign-summary the headline uses. */
export type HeadlineSummary = {
  goal: number;
  totalRaised: number;
};

const PLACEHOLDER_PATTERN = /\{(gesammelt|ziel|fehlt|prozent)\}/gi;

const formatEuro = (value: number): string =>
  `${Math.round(value).toLocaleString("de-DE")} €`;

/**
 * Fills the headline's placeholders with the campaign's amounts:
 * {gesammelt} (raised so far), {ziel} (goal), {fehlt} (left to the goal,
 * never below 0) and {prozent} (share of the goal, capped at 100). Amounts
 * are whole euros in German format ("12.345 €"). Placeholders are matched
 * case-insensitively; other text in braces is left as it is.
 */
export const formatHeadline = (
  template: string,
  summary: HeadlineSummary,
): string =>
  template.replace(PLACEHOLDER_PATTERN, (_match, name: string) => {
    switch (name.toLowerCase()) {
      case "gesammelt":
        return formatEuro(summary.totalRaised);
      case "ziel":
        return formatEuro(summary.goal);
      case "fehlt":
        return formatEuro(Math.max(summary.goal - summary.totalRaised, 0));
      default: {
        const percent =
          summary.goal > 0
            ? Math.min(
                100,
                Math.floor((summary.totalRaised / summary.goal) * 100),
              )
            : 0;
        return `${percent} %`;
      }
    }
  });
