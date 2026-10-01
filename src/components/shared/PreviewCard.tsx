import * as React from "react";
import { Card } from "@volksverpetzer/ui-web";

/**
 * White card shell Storybook stories use to mimic the module's frontend
 * container. `moduleClass` must be the module's root class (e.g.
 * "vvp-trending-items") — the module's style.css nests all of its rules
 * under that class, so without it most styling silently doesn't apply.
 */
export const PreviewCard = ({
  children,
  moduleClass,
}: {
  children: React.ReactNode;
  moduleClass?: string;
}) => (
  <Card
    className={moduleClass}
    style={{
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
    }}
  >
    {children}
  </Card>
);
