import * as React from "react";

/**
 * White card shell Storybook stories use to mimic the module's frontend
 * container. `moduleClass` must be the module's root class (e.g.
 * "vvp-trending-items") — the module's style.css nests all of its rules
 * under that class, so without it most styling silently doesn't apply.
 */
export const PreviewCard = ({
  children,
  maxWidth,
  moduleClass,
}: {
  children: React.ReactNode;
  maxWidth?: number | string;
  moduleClass?: string;
}) => (
  <div
    className={moduleClass}
    style={{
      width: "100%",
      maxWidth: maxWidth ?? "100%",
      padding: "1.5rem",
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 1px 4px rgba(0,0,0,.08)",
      boxSizing: "border-box",
    }}
  >
    {children}
  </div>
);
