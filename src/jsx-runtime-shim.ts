/**
 * JSX runtime shim for the Divi Visual Builder bundle.
 *
 * The Visual Builder provides React 18 via the `vendor.React` global, and
 * build.mjs externalizes `react` to it. The automatic JSX runtime, however,
 * is resolved from our local React 19, whose runtime tags elements with
 * Symbol.for('react.transitional.element') — React 18 doesn't recognize
 * these as elements and throws minified React error #31 in the builder.
 *
 * Routing element creation through the external React's createElement keeps
 * the element format in sync with whatever React version Divi ships.
 */
import * as React from "react";

export const Fragment = React.Fragment;

export function jsx(
  type: React.ElementType,
  props: Record<string, unknown>,
  key?: React.Key,
): React.ReactElement {
  return React.createElement(
    type,
    key === undefined ? props : { ...props, key },
  );
}

// jsxs (static children) and jsxDEV (dev runtime) only differ from jsx in
// validation behavior, which createElement handles itself.
export const jsxs = jsx;
export const jsxDEV = jsx;
