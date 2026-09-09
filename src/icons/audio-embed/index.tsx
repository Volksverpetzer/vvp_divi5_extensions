import React, { type ReactElement } from "react";

// Icon data for Divi icon library — headphones representing the audio player.
export const name = "vvp/audio-embed-icon";
export const viewBox = "0 0 24 24";
export const component = (): ReactElement => (
  <>
    <path
      d="M4 13a8 8 0 0116 0v5.5a2.5 2.5 0 01-2.5 2.5H16v-6h2.5v-2a6.5 6.5 0 00-13 0v2H8v6H6.5A2.5 2.5 0 014 18.5V13z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <rect
      x="4.5"
      y="14.5"
      width="3.5"
      height="6"
      rx="1.5"
      fill="currentColor"
      stroke="none"
    />
    <rect
      x="16"
      y="14.5"
      width="3.5"
      height="6"
      rx="1.5"
      fill="currentColor"
      stroke="none"
    />
  </>
);
