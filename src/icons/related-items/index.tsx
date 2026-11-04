import React, { type ReactElement } from "react";
import { iconStyle } from "../style";

// Icon data for Divi icon library — three linked cards.
// Drawn like Divi's own module icons (filled shapes on a 16×16 grid), in the
// VVP accent colour from ../style.
export const name = "vvp/related-items-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      style={iconStyle}
      fillRule="evenodd"
      d="M2.5,2h4c.3,0,.5.2.5.5v4c0,.3-.2.5-.5.5h-4C2.2,7,2,6.8,2,6.5v-4C2,2.2,2.2,2,2.5,2z M3,3v3h3V3z"
    />
    <path
      style={iconStyle}
      fillRule="evenodd"
      d="M9.5,2h4c.3,0,.5.2.5.5v4c0,.3-.2.5-.5.5h-4C9.2,7,9,6.8,9,6.5v-4C9,2.2,9.2,2,9.5,2z M10,3v3h3V3z"
    />
    <path
      style={iconStyle}
      fillRule="evenodd"
      d="M6,9h4c.3,0,.5.2.5.5v4c0,.3-.2.5-.5.5H6c-.3,0-.5-.2-.5-.5v-4C5.5,9.2,5.7,9,6,9z M6.5,10v3h3v-3z"
    />
    <path style={iconStyle} d="M4,7h1v.5h6V7h1v1.5H8.5V9h-1V8.5H4z" />
  </g>
);
