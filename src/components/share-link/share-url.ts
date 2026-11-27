import { renderSVG } from "uqr";

const HTTP_URL = /^https?:\/\//i;

/** Returns the trimmed URL when it is http(s), otherwise the fallback. */
export function safeShareUrl(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  return HTTP_URL.test(trimmed) ? trimmed : fallback;
}

/** Drops the scheme and one trailing slash for display. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/** Renders the URL as a QR code SVG string, generated locally. */
export function qrSvg(url: string): string {
  return renderSVG(url, { ecc: "M", border: 2 });
}
