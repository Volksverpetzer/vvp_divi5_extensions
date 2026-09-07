import * as React from "react";
import { type TrendingListItem } from "./types";
import { formatAuthors } from "./formatAuthors";

interface TrendingListAppProps {
  items: TrendingListItem[];
}

const getSafeHref = (rawLink: string): string => {
  const trimmed = rawLink.trim();
  if (!trimmed) {
    return "#";
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : "#";
  } catch {
    return "#";
  }
};

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
            href={getSafeHref(item.link)}
            className="vvp-tl__title"
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.title}
          </a>
          <span className="vvp-tl__meta">
            von {formatAuthors(item.authors)} | {item.date}
          </span>
        </div>
      ))}
    </div>
  );
};
