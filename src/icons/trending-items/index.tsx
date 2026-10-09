import React, { type ReactElement } from "react";
import { iconStyle } from "../style";

// Icon data for Divi icon library — rising trend line with arrow.
// Drawn like Divi's own module icons (filled shapes on a 16×16 grid), in the
// VVP accent colour from ../style.
export const name = "vvp/trending-items-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      style={iconStyle}
      d="M10.67,3l1.52,1.53-3.25,3.25-2.67-2.67L1.33,10.06,2.27,11l4-4,2.67,2.67,4.2-4.19L14.67,7V3z"
    />
    <path style={iconStyle} d="M1.5,12.5h13v1h-13z" />
  </g>
);
