import { type ModuleLibrary } from "@divi/types";

export type CtaBoxIcon =
  "none" | "star" | "bookmark" | "bell" | "newspaper" | "heart" | "check";

export type CtaBoxVariant = "accent" | "outline" | "subtle";

export interface CtaBoxAttrs {
  module: object;
  icon: object;
  heading: object;
  text: object;
  buttonLabel: object;
  buttonUrl: object;
  buttonNewTab: object;
  variant: object;
}

export type CtaBoxEditProps =
  ModuleLibrary.Module.Component.EditProps<CtaBoxAttrs>;

export interface CtaBoxAppProps {
  icon: CtaBoxIcon;
  heading: string;
  text: string;
  buttonLabel: string;
  buttonUrl: string;
  buttonNewTab: boolean;
  variant: CtaBoxVariant;
}
