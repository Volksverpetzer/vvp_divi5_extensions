import * as React from "react";
import { createRoot } from "react-dom/client";
import { type ArticleCardProps } from "../shared/ArticleCard";
import { TrendingItemsApp } from "./App";

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

    createRoot(mount).render(<TrendingItemsApp items={articles} />);
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
