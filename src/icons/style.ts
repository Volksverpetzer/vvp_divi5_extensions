import { type CSSProperties } from "react";

// Volksverpetzer accent colour (design token --vvp-color-accent) so our
// modules stand out from Divi's own in the module inserter. Set as an inline
// style on each path so it wins over the builder's CSS fill. #DB2685 keeps
// at least 3:1 contrast on both the dark and the light builder theme.
export const iconStyle: CSSProperties = { fill: "#DB2685" };
