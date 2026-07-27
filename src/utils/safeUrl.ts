/**
 * Guards against `javascript:`/`data:`-URL injection when rendering a URL
 * that originated from a DOM data-attribute (editor-configured, but CodeQL's
 * js/xss-through-dom flags it since nothing upstream guarantees the value
 * can't be attacker-controlled).
 *
 * Returns a freshly-constructed URL string rather than the original input —
 * a boolean guard next to the raw tainted string isn't enough to satisfy
 * static taint analysis, since the unmodified value still reaches the sink.
 * Rebuilding via `new URL(...).toString()` and using *that* value at the
 * call site breaks the flow instead. Only allows http(s) and relative/
 * root-relative paths; anything else (incl. javascript:, data:) returns null.
 */
export const toSafeUrl = (url: string): string | null => {
  try {
    const parsed = url.startsWith("/")
      ? new URL(url, "https://placeholder.invalid")
      : new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return url.startsWith("/")
      ? parsed.pathname + parsed.search + parsed.hash
      : parsed.toString();
  } catch {
    return null;
  }
};
