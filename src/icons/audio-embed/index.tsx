import React, { type ReactElement } from "react";
import { iconStyle } from "../style";

// Icon data for Divi icon library — headphones representing the audio player.
// Drawn like Divi's own module icons (filled shapes on a 16×16 grid), in the
// VVP accent colour from ../style.
export const name = "vvp/audio-embed-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path
      style={iconStyle}
      d="M8,2.5c-3.3,0-6,2.7-6,6V13c0,.6.4,1,1,1h1.5c.6,0,1-.4,1-1v-3c0-.6-.4-1-1-1H3v-.5c0-2.8,2.2-5,5-5s5,2.2,5,5V9h-1.5c-.6,0-1,.4-1,1v3c0,.6.4,1,1,1H13c.6,0,1-.4,1-1V8.5C14,5.2,11.3,2.5,8,2.5z"
    />
  </g>
);
