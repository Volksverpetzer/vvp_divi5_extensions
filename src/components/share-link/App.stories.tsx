import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShareLinkApp } from "./App";
import { PreviewCard } from "../shared/PreviewCard";

const meta: Meta<typeof ShareLinkApp> = {
  title: "Modules/ShareLink",
  component: ShareLinkApp,
  decorators: [(Story) => <PreviewCard>{Story()}</PreviewCard>],
};

export default meta;
type Story = StoryObj<typeof ShareLinkApp>;

export const Default: Story = {
  args: {
    title: "Teile die Aktion!",
    text: "Zeig deinen Freunden, wie sie mitmachen können.",
    url: "https://volksverpetzer.de/weihnachten/",
    qrLabel: "Scan mit dem Handy",
    track: false,
  },
};

export const LongUrl: Story = {
  args: {
    ...Default.args,
    url: "https://volksverpetzer.de/aktionen/weihnachten/mitmachen/sehr-langer-pfad-der-abgeschnitten-wird/?utm_source=newsletter&utm_campaign=weihnachten",
  },
};

export const NoText: Story = {
  args: { ...Default.args, text: "" },
};
