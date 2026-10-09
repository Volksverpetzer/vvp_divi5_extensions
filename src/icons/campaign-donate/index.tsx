import React, { type ReactElement } from "react";
import { iconStyle } from "../style";

// Icon data for Divi icon library — heart representing a donation.
// Drawn like Divi's own module icons (filled shapes on a 16×16 grid), in the
// VVP accent colour from ../style.
export const name = "vvp/campaign-donate-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      style={iconStyle}
      d="M8,13.5S2,10,2,6.2C2,4.4,3.3,3,5,3c1.3,0,2.4.7,3,1.8C8.6,3.7,9.7,3,11,3c1.7,0,3,1.4,3,3.2C14,10,8,13.5,8,13.5z"
    />
  </g>
);
