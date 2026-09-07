import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CtaBoxApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";

const meta: Meta<typeof CtaBoxApp> = {
  title: "Modules/CtaBox",
  component: CtaBoxApp,
  decorators: [(Story) => <PreviewCard>{Story()}</PreviewCard>],
};

export default meta;
type Story = StoryObj<typeof CtaBoxApp>;

export const PreferredSource: Story = {
  args: {
    icon: "star",
    heading: "Als bevorzugte Quelle hinzufügen",
    text: "Markiere uns bei Google als bevorzugte Quelle, damit du künftig zuerst von uns hörst.",
    buttonLabel: "Jetzt hinzufügen",
    buttonUrl: "https://google.com",
    buttonNewTab: true,
    variant: "accent",
  },
};

export const Outline: Story = {
  args: {
    icon: "bell",
    heading: "Verpasse keine Recherche mehr",
    text: "Abonniere unseren Newsletter und bleib auf dem Laufenden.",
    buttonLabel: "Newsletter abonnieren",
    buttonUrl: "https://volksverpetzer.de/newsletter",
    buttonNewTab: false,
    variant: "outline",
  },
};

export const Subtle: Story = {
  args: {
    icon: "heart",
    heading: "Unterstütze unabhängigen Journalismus",
    text: "Mit deiner Spende ermöglichst du unsere Arbeit.",
    buttonLabel: "Jetzt spenden",
    buttonUrl: "https://volksverpetzer.de/spenden",
    buttonNewTab: true,
    variant: "subtle",
  },
};

export const NoIconNoButton: Story = {
  args: {
    icon: "none",
    heading: "Ein einfacher Hinweis",
    text: "Diese Box funktioniert auch ganz ohne Icon und Button.",
    buttonLabel: "",
    buttonUrl: "",
    buttonNewTab: false,
    variant: "subtle",
  },
};
