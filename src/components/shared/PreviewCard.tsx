import * as React from "react";

/** White card shell Storybook stories use to mimic the module's frontend container. */
export const PreviewCard = ({
  children,
  maxWidth,
}: {
  children: React.ReactNode;
  maxWidth?: number | string;
}) => (
  <div
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
