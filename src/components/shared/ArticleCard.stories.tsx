import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleCard } from "./ArticleCard";
import { PreviewCard } from "./PreviewCard";
import { FEED_ARTICLES } from "./previewFixtures";

const meta: Meta<typeof ArticleCard> = {
  title: "Modules/ContentOverview/ArticleCard",
  component: ArticleCard,
  decorators: [(Story) => <PreviewCard maxWidth={360}>{Story()}</PreviewCard>],
};

export default meta;
type Story = StoryObj<typeof ArticleCard>;

export const Volksverpetzer: Story = {
  args: FEED_ARTICLES[0],
};

export const Pruefpunkt: Story = {
  args: FEED_ARTICLES.find((a) => a.source === "pruefpunkt")!,
};
