import React, { type ReactElement } from "react";

// Icon data for Divi icon library — box with a star.
// Drawn like Divi's own module icons: filled shapes on a 16×16 grid without
// fill/stroke attributes, so the builder's CSS fill colours them.
export const name = "vvp/cta-box-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      fillRule="evenodd"
      d="M3,3h10c.6,0,1,.4,1,1v8c0,.6-.4,1-1,1H3c-.6,0-1-.4-1-1V4c0-.6.4-1,1-1z M3,4v8h10V4z"
    />
    <path d="M8,5.3l.7,2l2.1.1-1.7,1.3.6,2-1.8-1.2-1.8,1.2.6-2-1.7-1.3,2.1-.1z" />
  </g>
);
