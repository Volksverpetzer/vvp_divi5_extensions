import React, { type ReactElement } from "react";

// Icon data for Divi icon library — newspaper/grid icon representing a news overview.
export const name = "vvp/content-overview-icon";
export const viewBox = "0 0 24 24";
export const component = (): ReactElement => (
  <>
    {/* Outer document frame */}
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    {/* Large hero image placeholder (top-left 2/3) */}
    <rect
      x="5"
      y="5"
      width="9"
      height="7"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    {/* Sidebar lines (top-right 1/3) */}
    <line
      x1="16"
      y1="5.5"
      x2="19"
      y2="5.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="8"
      x2="19"
      y2="8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="10.5"
      x2="19"
      y2="10.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Feed grid — 3 small cards in a row */}
    <rect
      x="5"
      y="14"
      width="4"
      height="5"
      rx="0.75"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="10"
      y="14"
      width="4"
      height="5"
      rx="0.75"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="15"
      y="14"
      width="4"
      height="5"
      rx="0.75"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </>
);
