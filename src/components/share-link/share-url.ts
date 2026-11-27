import { renderSVG } from "uqr";

const HTTP_URL = /^https?:\/\//i;

/**
 * Returns the trimmed URL when it is http(s), otherwise the fallback.
 * With `base`, a site path like `/weihnachten/` (not `//host`) is resolved
 * against it, for the Visual Builder where PHP does not resolve it.
 */
export function safeShareUrl(
  raw: string,
  fallback: string,
  base?: string,
): string {
  const trimmed = raw.trim();
  if (base && trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return base + trimmed;
  }
  return HTTP_URL.test(trimmed) ? trimmed : fallback;
}

/** Drops the scheme and one trailing slash, decodes %-escapes for display. */
export function displayUrl(url: string): string {
  const short = url.replace(HTTP_URL, "").replace(/\/$/, "");
  try {
    return decodeURI(short);
  } catch {
    return short;
  }
}

/** Renders the URL as a QR code SVG string (empty if it is too long). */
export function qrSvg(url: string): string {
  try {
    return renderSVG(url, { ecc: "M", border: 4 });
  } catch {
    return "";
  }
}
