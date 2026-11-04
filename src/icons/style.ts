import { type CSSProperties } from "react";

// Volksverpetzer accent colour so our modules stand out from Divi's own in the
// module inserter. Reads the --vvp-color-accent design token (so WP-admin brand
// overrides apply) and falls back to its default #DB2685 wherever the token
// stylesheet isn't loaded, e.g. the builder's top window. Set as an inline
// style on each path so it wins over the builder's CSS fill. #DB2685 keeps
// at least 3:1 contrast on both the dark and the light builder theme.
export const iconStyle: CSSProperties = {
  fill: "var(--vvp-color-accent, #DB2685)",
};
