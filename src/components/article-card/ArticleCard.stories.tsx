import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";
import { PreviewCard } from "../shared/PreviewCard";
import { FEED_ARTICLES } from "../shared/previewFixtures";

/**
 * The shared article card — rendered by the Artikelkarte module, the
 * ContentOverview feed, TrendingItems and RelatedItems. `.vvp-article-card`
 * is the Artikelkarte module's root class.
 */
const meta: Meta<typeof ArticleCard> = {
  title: "Modules/ArticleCard",
  component: ArticleCard,
  decorators: [(Story) => <PreviewCard>{Story()}</PreviewCard>],
  render: (args) => (
    <div className="vvp-article-card">
      <ArticleCard {...args} />
    </div>
  ),
  argTypes: {
    type: { control: "inline-radio", options: ["article", "youtube"] },
    source: {
      control: "inline-radio",
      options: ["volksverpetzer", "pruefpunkt"],
    },
    trackingContext: {
      control: "inline-radio",
      options: ["feed", "trending", "related"],
    },
    reading_time: { control: { type: "number", min: 0 } },
    external: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ArticleCard>;

const pruefpunkt = FEED_ARTICLES.find((a) => a.source === "pruefpunkt")!;

/** Every prop exposed as a control. */
export const Playground: Story = {
  args: {
    ...FEED_ARTICLES[0],
    type: "article",
    author: "Minka Fellstein",
    trackingContext: "feed",
    external: false,
  },
};

// ── Loop grid ────────────────────────────────────────────────────────────────

/**
 * The Artikelkarte module renders one card; Divi's Loop repeats it per post
 * and lays the copies out in the row's columns (e.g. an author archive).
 * Fixture articles are cycled when `count` exceeds the fixture set.
 */
const ArchiveGrid = ({
  columns,
  count,
}: {
  columns: number;
  count: number;
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: "24px",
    }}
  >
    {Array.from({ length: count }, (_, i) => {
      const article: ArticleCardProps = FEED_ARTICLES[i % FEED_ARTICLES.length];
      return (
        <div key={i} className="vvp-article-card">
          <ArticleCard {...article} author="Minka Fellstein" />
        </div>
      );
    })}
  </div>
);

/** Columns and card count adjustable — defaults mirror an author archive. */
export const LoopGrid: StoryObj<typeof ArchiveGrid> = {
  render: (args) => <ArchiveGrid {...args} />,
  parameters: { controls: { include: ["columns", "count"] } },
  args: { columns: 3, count: 6 },
  argTypes: {
    columns: { control: { type: "range", min: 1, max: 4, step: 1 } },
    count: { control: { type: "range", min: 1, max: 24, step: 1 } },
  },
};

// ── States ───────────────────────────────────────────────────────────────────

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
