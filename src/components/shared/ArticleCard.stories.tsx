import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleCard } from "./ArticleCard";
import { PreviewCard } from "./PreviewCard";
import { FEED_ARTICLES } from "./previewFixtures";

const meta: Meta<typeof ArticleCard> = {
  title: "Modules/ContentOverview/ArticleCard",
  component: ArticleCard,
  decorators: [(Story) => <PreviewCard>{Story()}</PreviewCard>],
};

export default meta;
type Story = StoryObj<typeof ArticleCard>;

const pruefpunkt = FEED_ARTICLES.find((a) => a.source === "pruefpunkt")!;

export const Volksverpetzer: Story = {
  args: FEED_ARTICLES[0],
};

export const Pruefpunkt: Story = {
  name: "Prüfpunkt (external, opens new tab)",
  args: { ...pruefpunkt, link: "https://pruefpunkt.org/", external: true },
};

export const MultipleAuthors: Story = {
  args: { ...FEED_ARTICLES[0], author: "Minka Fellstein und Tom Kater" },
};

export const WithoutImage: Story = {
  args: { ...FEED_ARTICLES[1], image_url: undefined },
};

export const WithoutExcerpt: Story = {
  name: "Without excerpt (no author line)",
  args: { ...FEED_ARTICLES[3], excerpt: undefined },
};

export const Minimal: Story = {
  name: "Minimal (title + date only)",
  args: { title: FEED_ARTICLES[4].title, link: "#", date: "01.10.2026" },
};
