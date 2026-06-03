import * as React from "react";
import { createRoot } from "react-dom/client";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-ti__mount:not([data-ti-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-ti-initialized", "true");

    let articles: ArticleCardProps[] = [];
    try {
      articles = JSON.parse(mount.getAttribute("data-articles") || "[]");
    } catch {
      articles = [];
    }

    if (!articles.length) {
      createRoot(mount).render(
        <div className="vvp-ti__empty">Keine Trending-Beiträge gefunden.</div>,
      );
      return;
    }

    createRoot(mount).render(
      <div className="vvp-ti__list">
        {articles.map((props) => (
          <div key={props.link} className="vvp-ti__item">
            <ArticleCard {...props} trackingContext="trending" />
          </div>
        ))}
      </div>,
    );
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
