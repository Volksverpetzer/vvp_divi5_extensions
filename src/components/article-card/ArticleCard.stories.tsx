import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleCard } from "../shared/ArticleCard";
import { PreviewCard } from "../shared/PreviewCard";
import { FEED_ARTICLES } from "../shared/previewFixtures";

/**
 * The Artikelkarte module renders one card; Divi's Loop repeats it per post
 * and lays the copies out in the row's columns. These stories mimic that
 * grid (e.g. an author archive) — the card itself is covered by
 * Modules/ContentOverview/ArticleCard.
 */
const LoopGrid = ({ columns, count }: { columns: number; count: number }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: "24px",
    }}
  >
    {FEED_ARTICLES.slice(0, count).map((article) => (
      <div key={article.title} className="vvp-article-card">
        <ArticleCard {...article} author="Minka Fellstein" />
      </div>
    ))}
  </div>
);

const meta: Meta<typeof LoopGrid> = {
  title: "Modules/ArticleCard",
  component: LoopGrid,
  decorators: [(Story) => <PreviewCard>{Story()}</PreviewCard>],
};

export default meta;
type Story = StoryObj<typeof LoopGrid>;

export const AuthorArchive: Story = {
  name: "Author archive (3 columns)",
  args: { columns: 3, count: 6 },
};

export const TwoColumns: Story = {
  args: { columns: 2, count: 4 },
};

export const SingleColumn: Story = {
  name: "Single column (mobile)",
  args: { columns: 1, count: 3 },
};
