import * as React from "react";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";

// Visual Builder preview and Storybook only. On the site, TrendingItems's
// RenderCallbackTrait.php renders this same list server-side, with each card
// hydrated by content-overview-frontend.js — keep the two in sync.
interface TrendingItemsAppProps {
  items: ArticleCardProps[];
}

export const TrendingItemsApp = ({ items }: TrendingItemsAppProps) => {
  if (!items.length) {
    return (
      <div className="vvp-ti__empty">Keine Trending-Beiträge gefunden.</div>
    );
  }
  return (
    <div className="vvp-ti__list">
      {items.map((props) => (
        <div key={props.link + props.title} className="vvp-ti__item">
          <ArticleCard {...props} trackingContext="trending" />
        </div>
      ))}
    </div>
  );
};
