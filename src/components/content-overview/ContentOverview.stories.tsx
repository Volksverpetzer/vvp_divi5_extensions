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
  FEED_PODCAST_2,
} from "../shared/previewFixtures";

// Mirrors PHP's "Nur Artikel" toggle markup (RenderCallbackTrait::render_overview),
// only rendered when the real module would show more than one content type.
const FilterToggle = () => (
  <label className="vvp-co__filter-toggle" htmlFor="vvp-co-filter-articles">
    <span className="vvp-co__filter-toggle-label">Nur Artikel</span>
    <span className="vvp-co__toggle-track">
      <input
        type="checkbox"
        className="vvp-co__toggle-input"
        id="vvp-co-filter-articles"
      />
      <span className="vvp-co__toggle-thumb"></span>
    </span>
  </label>
);

// Mirrors PHP's "Mehr laden" button markup — real interactivity (revealing
// hidden `.vvp-co__feed-item`s) comes from frontend.tsx's initLoadMore(),
// which isn't wired up in Storybook, so this is a static visual only.
const LoadMoreButton = ({ hidden }: { hidden?: boolean }) => (
  <button
    type="button"
    className="vvp-co__load-more-btn"
    data-co-load-more
    data-co-batch-size="12"
    hidden={hidden}
  >
    Mehr laden
  </button>
);

const ContentOverviewFeed = () => (
  <div className="vvp-co__wrapper">
    <div className="vvp-co__section-header">
      <h2 className="vvp-co__section-title">Das Neueste</h2>
      <FilterToggle />
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
        data-co-kind="podcast_banner"
      >
        <PodcastBanner {...FEED_PODCAST} />
      </div>
    </div>
    {/* Nothing hidden in this mixed-feed example, so no more to load. */}
    <LoadMoreButton hidden />
  </div>
);

// Content type narrowed to "podcast" only, as on /podcast/ — the filter
// toggle auto-hides (nothing to filter) and every episode gets its own
// full-width banner, with older episodes hidden behind "Mehr laden".
const PodcastOnlyFeed = () => (
  <div className="vvp-co__wrapper">
    <div className="vvp-co__section-header">
      <h2 className="vvp-co__section-title">Das Neueste</h2>
    </div>
    <div className="vvp-co__feed-grid">
      <div
        className="vvp-co__feed-item vvp-co__feed-item--podcast"
        data-co-kind="podcast_banner"
      >
        <PodcastBanner {...FEED_PODCAST} />
      </div>
      <div
        className="vvp-co__feed-item vvp-co__feed-item--podcast"
        data-co-kind="podcast_banner"
        hidden
      >
        <PodcastBanner {...FEED_PODCAST_2} />
      </div>
    </div>
    <LoadMoreButton />
  </div>
);

const meta: Meta<typeof ContentOverviewFeed> = {
  title: "Modules/ContentOverview/Feed",
  component: ContentOverviewFeed,
};

export default meta;
type Story = StoryObj<typeof ContentOverviewFeed>;

export const Full: Story = {};

export const PodcastOnly: Story = {
  render: () => <PodcastOnlyFeed />,
};
