import React, { type ReactElement } from "react";
import { iconStyle } from "../style";

// Icon data for Divi icon library — share nodes with a QR-style square.
// Drawn like Divi's own module icons (filled shapes on a 16×16 grid), in the
// VVP accent colour from ../style.
export const name = "vvp/share-link-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      style={iconStyle}
      fillRule="evenodd"
      d="M12,2a2,2,0,1,1,0,4a2,2,0,0,1,0-4z M12,3.2a.8.8,0,1,0,0,1.6a.8.8,0,0,0,0-1.6z M4,6a2,2,0,1,1,0,4a2,2,0,0,1,0-4z M4,7.2a.8.8,0,1,0,0,1.6a.8.8,0,0,0,0-1.6z M12,10a2,2,0,1,1,0,4a2,2,0,0,1,0-4z M12,11.2a.8.8,0,1,0,0,1.6a.8.8,0,0,0,0-1.6z"
    />
    <path
      style={iconStyle}
      d="M5.7,7.2l4.7-2.5l.5.9l-4.7,2.5z M5.7,8.8l.5-.9l4.7,2.5l-.5.9z"
    />
  </g>
);
