import * as React from "react";
import { createRoot } from "react-dom/client";
import { type TrendingListItem } from "./types";

const TrendingList: React.FC<{ items: TrendingListItem[] }> = ({ items }) => (
  <div className="vvp-tl__list">
    {items.map((item) => (
      <div key={item.link} className="vvp-tl__item">
        <a
          href={item.link}
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

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-tl__mount:not([data-tl-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-tl-initialized", "true");

    let items: TrendingListItem[] = [];
    try {
      items = JSON.parse(mount.getAttribute("data-articles") || "[]");
    } catch {
      items = [];
    }

    if (!items.length) {
      createRoot(mount).render(
        <div className="vvp-tl__empty">Keine Trending-Beiträge gefunden.</div>,
      );
      return;
    }

    createRoot(mount).render(<TrendingList items={items} />);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}

if (document.body && "MutationObserver" in window) {
  const observer = new MutationObserver(initAll);
  observer.observe(document.body, { childList: true, subtree: true });
}
