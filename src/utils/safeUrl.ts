/**
 * Guards against `javascript:`/`data:`-URL injection when rendering a URL
 * that originated from a DOM data-attribute (editor-configured, but CodeQL
 * flags it as DOM text reinterpreted as HTML — js/xss-through-dom — since
 * nothing upstream guarantees the value can't be attacker-controlled).
 * Only allows http(s) and relative/root-relative paths.
 */
export const isSafeUrl = (url: string): boolean => {
  if (url.startsWith("/")) return true;
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
};
