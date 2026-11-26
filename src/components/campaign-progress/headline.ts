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

export type HeadlinePart = { text: string; small: boolean };

const SMALL_PATTERN = /<small>([\s\S]*?)<\/small>/gi;

/**
 * Splits a filled headline into plain and <small>…</small> parts, so the
 * component can render the small parts in a <small> element. Only this one
 * tag is recognised (case-insensitively); everything else, including an
 * unclosed <small> or any other HTML, stays plain text that React escapes.
 * Empty parts are dropped.
 */
export const splitHeadline = (headline: string): HeadlinePart[] => {
  const parts: HeadlinePart[] = [];
  let last = 0;
  for (const match of headline.matchAll(SMALL_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ text: headline.slice(last, index), small: false });
    }
    if (match[1]) parts.push({ text: match[1], small: true });
    last = index + match[0].length;
  }
  if (last < headline.length) {
    parts.push({ text: headline.slice(last), small: false });
  }
  return parts;
};
