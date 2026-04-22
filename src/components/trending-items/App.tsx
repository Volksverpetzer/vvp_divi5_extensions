import * as React from "react";
import { type TrendingItem } from "./types";

interface TrendingItemsAppProps {
  items: TrendingItem[];
  showThumbnail: boolean;
}

const TrendingItemCard = ({
  item,
  rank,
  showThumbnail,
}: {
  item: TrendingItem;
  rank: number;
  showThumbnail: boolean;
}) => (
  <li className="vvp-ti__item">
    <a href={item.url} className="vvp-ti__link">
      {showThumbnail && item.thumbnailUrl && (
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="vvp-ti__thumb"
          loading="lazy"
        />
      )}
      <span className="vvp-ti__rank">{rank}</span>
      <span className="vvp-ti__title">{item.title}</span>
    </a>
  </li>
);

export const TrendingItemsApp = ({
  items,
  showThumbnail,
}: TrendingItemsAppProps) => {
  if (!items.length) {
    return (
      <div className="vvp-ti__empty">Keine Trending-Beiträge gefunden.</div>
    );
  }

  return (
    <ol className="vvp-ti__list">
      {items.map((item, i) => (
        <TrendingItemCard
          key={item.url}
          item={item}
          rank={i + 1}
          showThumbnail={showThumbnail}
        />
      ))}
    </ol>
  );
};
