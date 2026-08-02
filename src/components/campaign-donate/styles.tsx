import { type Module } from "@divi/types";
import { type CampaignDonateAttrs } from "./types";

// DIAGNOSTIC: temporarily simplified to isolate a bug where the module's
// wrapper class (from module-classnames.ts) doesn't get applied in the Divi
// Visual Builder editor — only reproduces when a StyleContainer/elements.style()
// styles.tsx is combined with a stateful (useState/useEffect) App component.
// Revert to the StyleContainer/elements.style() version once confirmed/fixed.
export const ModuleStyles = (
  _props: Module.StylesProps<CampaignDonateAttrs>,
) => {
  return null;
};
