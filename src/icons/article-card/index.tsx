import React, { type ReactElement } from "react";

// Icon data for Divi icon library — card with image area and text lines.
export const name = "vvp/article-card-icon";
export const viewBox = "0 0 24 24";
export const component = (): ReactElement => (
  <>
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path d="M4 11h16" fill="none" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M7.5 14.5h9M7.5 17.5h6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </>
);
