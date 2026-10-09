import React, { type ReactElement } from "react";
import { iconStyle } from "../style";

// Icon data for Divi icon library — page with hero teaser, sidebar lines and a feed row.
// Drawn like Divi's own module icons (filled shapes on a 16×16 grid), in the
// VVP accent colour from ../style.
export const name = "vvp/content-overview-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      style={iconStyle}
      fillRule="evenodd"
      d="M3,2h10c.6,0,1,.4,1,1v10c0,.6-.4,1-1,1H3c-.6,0-1-.4-1-1V3c0-.6.4-1,1-1z M3,3v10h10V3z"
    />
    <path
      style={iconStyle}
      d="M4,4h4.5v4H4z M9.5,4H12v1H9.5z M9.5,5.5H12v1H9.5z M9.5,7H12v1H9.5z"
    />
    <path
      style={iconStyle}
      d="M4,9.5h2.3V12H4z M6.85,9.5h2.3V12H6.85z M9.7,9.5H12V12H9.7z"
    />
  </g>
);
