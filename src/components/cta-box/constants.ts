import { type CtaBoxIcon, type CtaBoxVariant } from "./types";

export const DEFAULT_ICON: CtaBoxIcon = "star";
export const DEFAULT_VARIANT: CtaBoxVariant = "accent";

export const ICON_OPTIONS: { value: CtaBoxIcon; label: string }[] = [
  { value: "none", label: "Kein Icon" },
  { value: "star", label: "Stern" },
  { value: "bookmark", label: "Lesezeichen" },
  { value: "bell", label: "Glocke" },
  { value: "newspaper", label: "Zeitung" },
  { value: "heart", label: "Herz" },
  { value: "check", label: "Häkchen" },
];

export const VARIANT_OPTIONS: { value: CtaBoxVariant; label: string }[] = [
  { value: "accent", label: "Akzent (gefüllter Hintergrund)" },
  { value: "outline", label: "Outline (nur Rahmen)" },
  { value: "subtle", label: "Dezent (leichter Hintergrund)" },
];
