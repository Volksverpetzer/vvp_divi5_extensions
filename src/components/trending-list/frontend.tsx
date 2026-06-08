import * as React from "react";
import { createRoot } from "react-dom/client";
import { type TrendingListItem } from "./types";
import { TrendingListApp } from "./App";

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-tl__mount:not([data-tl-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-tl-initialized", "true");

    let items: TrendingListItem[];
    try {
      items = JSON.parse(mount.getAttribute("data-articles") || "[]");
    } catch {
      items = [];
    }

    createRoot(mount).render(<TrendingListApp items={items} />);
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
