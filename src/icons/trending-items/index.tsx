import React, { type ReactElement } from "react";

export const name = "vvp/trending-items-icon";
export const viewBox = "0 0 24 24";
export const component = (): ReactElement => (
  <>
    <polyline
      points="3,17 8,11 13,14 21,5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="16,5 21,5 21,10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="3"
      y1="21"
      x2="21"
      y2="21"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </>
);
