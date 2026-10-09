import * as React from "react";
import { MetaText } from "@volksverpetzer/ui-web";
import { type TrendingListItem } from "./types";
import { formatAuthors } from "./formatAuthors";
import { isExternalUrl } from "../../utils/links";

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
      {items.map((item) => {
        const href = getSafeHref(item.link);
        const external = isExternalUrl(href);
        return (
          <div key={item.link} className="vvp-tl__item">
            <a
              href={href}
              className="vvp-tl__title"
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              {item.title}
            </a>
            <MetaText className="vvp-tl__meta">
              von {formatAuthors(item.authors)} | {item.date}
            </MetaText>
          </div>
        );
      })}
    </div>
  );
};
