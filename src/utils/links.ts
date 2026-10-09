/**
 * Whether a URL points away from the current site, i.e. should open in a new
 * tab. Relative URLs, fragments and same-host URLs are internal ("www." is
 * ignored, matching is_external_url() in CardRenderTrait.php); anything
 * unparsable is treated as internal so a bad link never spawns a tab.
 *
 * Hydrated cards must not rely on this — PHP passes an explicit `external`
 * prop there so server and client markup always agree (see the hydration
 * guardrail in content-overview/frontend.tsx).
 */
const normalizeHost = (host: string): string =>
  host.toLowerCase().replace(/^www\./, "");

/**
 * Resolve a URL (relative ones against the current page) and return it only
 * if it's http(s). Anything else (`javascript:`, `data:`, unparsable input)
 * yields null, so callers that navigate programmatically can't be turned
 * into script execution by URLs from post or REST data.
 */
export const toHttpUrl = (url: string): URL | null => {
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed
      : null;
  } catch {
    return null;
  }
};

export const isExternalUrl = (url: string): boolean => {
  const parsed = toHttpUrl(url);
  return (
    parsed !== null &&
    normalizeHost(parsed.host) !== normalizeHost(window.location.host)
  );
};
