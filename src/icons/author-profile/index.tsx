import React, { type ReactElement } from "react";

// Icon data for Divi icon library — person silhouette representing an author.
// Drawn like Divi's own module icons: filled shapes on a 16×16 grid without
// fill/stroke attributes, so the builder's CSS fill colours them.
export const name = "vvp/author-profile-icon";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <g>
    <path d="M8,2.5c1.4,0,2.5,1.1,2.5,2.5S9.4,7.5,8,7.5S5.5,6.4,5.5,5S6.6,2.5,8,2.5z" />
    <path d="M3,13.5C3,10.5,5.2,9,8,9s5,1.5,5,4.5c0,.3-.2.5-.5.5h-9C3.2,14,3,13.8,3,13.5z" />
  </g>
);
