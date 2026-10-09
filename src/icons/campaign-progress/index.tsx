import React, { type ReactElement } from "react";
import { iconStyle } from "../style";

// Icon data for Divi icon library — partially filled progress bar.
// Drawn like Divi's own module icons (filled shapes on a 16×16 grid), in the
// VVP accent colour from ../style.
export const name = "vvp/campaign-progress-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      style={iconStyle}
      fillRule="evenodd"
      d="M4,5.5h8c1.4,0,2.5,1.1,2.5,2.5s-1.1,2.5-2.5,2.5H4c-1.4,0-2.5-1.1-2.5-2.5S2.6,5.5,4,5.5z M4,6.5c-.8,0-1.5.7-1.5,1.5S3.2,9.5,4,9.5h8c.8,0,1.5-.7,1.5-1.5S12.8,6.5,12,6.5z"
    />
    <path style={iconStyle} d="M4.5,7h5v2h-5c-.6,0-1-.4-1-1S3.9,7,4.5,7z" />
  </g>
);
