import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleCard } from "../shared/ArticleCard";
import { InstagramSlideshow } from "./InstagramSlideshow";
import { PodcastBanner } from "./PodcastBanner";
import { YouTubeBanner } from "./YouTubeBanner";
import {
  FEED_ARTICLES,
  FEED_IG,
  FEED_YT,
  FEED_YT_2,
  FEED_PODCAST,
} from "../shared/previewFixtures";

const ContentOverviewFeed = () => (
  <div className="vvp-co__wrapper">
    <div className="vvp-co__section-header">
      <h2 className="vvp-co__section-title">Das Neueste</h2>
    </div>
    <div className="vvp-co__feed-grid">
      {FEED_ARTICLES.slice(0, 3).map((a, i) => (
        <div key={i} className="vvp-co__feed-item" data-co-kind="article">
          <ArticleCard {...a} />
        </div>
      ))}
      <div
        className="vvp-co__feed-item vvp-co__feed-item--youtube-banner"
        data-co-kind="youtube"
      >
        <YouTubeBanner {...FEED_YT} />
      </div>
      <div
        className="vvp-co__feed-item vvp-co__feed-item--youtube-banner"
        data-co-kind="youtube"
      >
        <YouTubeBanner {...FEED_YT_2} />
      </div>
      {FEED_ARTICLES.slice(3, 6).map((a, i) => (
        <div key={i + 3} className="vvp-co__feed-item" data-co-kind="article">
          <ArticleCard {...a} />
        </div>
      ))}
      {FEED_IG.map((ig, i) => (
        <div
          key={`ig-${i}`}
          className="vvp-co__feed-item"
          data-co-kind="instagram"
        >
          <InstagramSlideshow {...ig} />
        </div>
      ))}
      <div
        className="vvp-co__feed-item vvp-co__feed-item--podcast"
        data-co-kind="podcast"
      >
        <PodcastBanner {...FEED_PODCAST} />
      </div>
    </div>
  </div>
);

const meta: Meta<typeof ContentOverviewFeed> = {
  title: "Modules/ContentOverview/Feed",
  component: ContentOverviewFeed,
};

export default meta;
type Story = StoryObj<typeof ContentOverviewFeed>;

export const Full: Story = {};
