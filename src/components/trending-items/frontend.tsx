import * as React from "react";
import { createRoot } from "react-dom/client";
import { TrendingItemsApp } from "./App";
import { type TrendingItem } from "./types";

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-ti__mount:not([data-ti-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-ti-initialized", "true");

    let items: TrendingItem[] = [];
    try {
      items = JSON.parse(mount.getAttribute("data-items") || "[]");
    } catch {
      items = [];
    }

    const showThumbnail =
      mount.getAttribute("data-show-thumbnail") !== "false";

    createRoot(mount).render(
      <TrendingItemsApp items={items} showThumbnail={showThumbnail} />,
    );
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}

document.addEventListener("et_pb_reinit_modules", initAll);
document.addEventListener("ajaxComplete", initAll);

if (document.body && "MutationObserver" in window) {
  const observer = new MutationObserver(initAll);
  observer.observe(document.body, { childList: true, subtree: true });
}
