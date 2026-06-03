import * as React from "react";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";

interface TrendingItemsAppProps {
  items: ArticleCardProps[];
}

export const TrendingItemsApp = ({ items }: TrendingItemsAppProps) => {
  if (!items.length) {
    return <div className="vvp-ti__empty">Keine Trending-Beiträge gefunden.</div>;
  }
  return (
    <div className="vvp-ti__list">
      {items.map((props) => (
        <div key={props.link} className="vvp-ti__item">
          <ArticleCard {...props} trackingContext="trending" />
        </div>
      ))}
    </div>
  );
};
