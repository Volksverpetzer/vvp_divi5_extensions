import React, { type ReactElement } from "react";

export const name = "vvp/cta-box-icon";
export const viewBox = "0 0 24 24";
export const component = (): ReactElement => (
  <>
    <rect
      x="2.5"
      y="4"
      width="19"
      height="16"
      rx="2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M12 8.2l1.5 3 3.3.3-2.5 2.2.8 3.2-3.1-1.9-3.1 1.9.8-3.2-2.5-2.2 3.3-.3z"
      fill="currentColor"
      stroke="none"
    />
  </>
);
