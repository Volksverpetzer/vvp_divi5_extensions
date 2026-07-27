import * as React from "react";
import { createRoot } from "react-dom/client";
import { type ArticleCardProps } from "../shared/ArticleCard";
import { RelatedItemsApp } from "./App";

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-ri__mount:not([data-ri-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-ri-initialized", "true");

    let articles: ArticleCardProps[];
    try {
      articles = JSON.parse(mount.getAttribute("data-articles") || "[]");
    } catch {
      articles = [];
    }

    createRoot(mount).render(<RelatedItemsApp items={articles} />);
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
