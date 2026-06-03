import React, { type ReactElement } from "react";

// Icon data for Divi icon library — person silhouette icon representing an author.
export const name = "vvp/author-profile-icon";
export const viewBox = "0 0 24 24";
export const component = (): ReactElement => (
  <>
    {/* Person silhouette */}
    <circle
      cx="12"
      cy="8"
      r="3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    {/* Small lines representing bio text */}
    <line x1="9" y1="8.5" x2="15" y2="8.5" stroke="none" />
  </>
);
