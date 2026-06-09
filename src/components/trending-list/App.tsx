import * as React from "react";
import { type TrendingListItem } from "./types";

interface TrendingListAppProps {
  items: TrendingListItem[];
}

export const TrendingListApp: React.FC<TrendingListAppProps> = ({ items }) => {
  if (!items.length) {
    return (
      <div className="vvp-tl__empty">Keine Trending-Beiträge gefunden.</div>
    );
  }
  return (
    <div className="vvp-tl__list">
      {items.map((item) => (
        <div key={item.link} className="vvp-tl__item">
          <a
            href={/^https?:\/\//i.test(item.link.trim()) ? item.link : "#"}
            className="vvp-tl__title"
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.title}
          </a>
          <span className="vvp-tl__meta">
            von {item.author} | {item.date}
          </span>
        </div>
      ))}
    </div>
  );
};
