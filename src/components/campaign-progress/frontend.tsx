import * as React from "react";
import { createRoot } from "react-dom/client";
import { CampaignProgressApp } from "./App";
import { DEFAULT_GOAL_EUR } from "./constants";

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-cp__mount:not([data-cp-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-cp-initialized", "true");

    const apiUrl = mount.getAttribute("data-summary-url") || "";
    const fallbackGoal =
      Number(mount.getAttribute("data-goal")) || DEFAULT_GOAL_EUR;
    const initialTotal = Number(mount.getAttribute("data-initial-total")) || 0;
    const initialGoal =
      Number(mount.getAttribute("data-initial-goal")) || fallbackGoal;

    createRoot(mount).render(
      <CampaignProgressApp
        total={initialTotal}
        goal={initialGoal}
        apiUrl={apiUrl || undefined}
      />,
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
