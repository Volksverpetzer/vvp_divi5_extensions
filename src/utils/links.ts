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

export const isExternalUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url, window.location.href);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    return normalizeHost(parsed.host) !== normalizeHost(window.location.host);
  } catch {
    return false;
  }
};
