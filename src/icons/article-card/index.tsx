import React, { type ReactElement } from "react";

// Icon data for Divi icon library — card with image area and text lines.
// Drawn like Divi's own module icons: filled shapes on a 16×16 grid without
// fill/stroke attributes, so the builder's CSS fill colours them.
export const name = "vvp/article-card-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      fillRule="evenodd"
      d="M4,2h8c.6,0,1,.4,1,1v10c0,.6-.4,1-1,1H4c-.6,0-1-.4-1-1V3c0-.6.4-1,1-1z M4,8v5h8V8z"
    />
    <path d="M5.5,9h5v1h-5z M5.5,11H9v1H5.5z" />
  </g>
);
