import React, { type ReactElement } from "react";

// Icon data for Divi icon library — magnifying glass with checkmark.
// Drawn like Divi's own module icons: filled shapes on a 16×16 grid without
// fill/stroke attributes, so the builder's CSS fill colours them.
export const name = "vvp/fact-check-search-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      fillRule="evenodd"
      d="M7,2c2.8,0,5,2.2,5,5s-2.2,5-5,5S2,9.8,2,7S4.2,2,7,2z M7,3C4.8,3,3,4.8,3,7s1.8,4,4,4s4-1.8,4-4S9.2,3,7,3z"
    />
    <path d="M10.3,11.7l1.4-1.4l2.8,2.8c.4.4.4,1,0,1.4s-1,.4-1.4,0z" />
    <path d="M4.6,7.3l.7-.7l1,1L8.9,5l.7.7L6.3,9z" />
  </g>
);
