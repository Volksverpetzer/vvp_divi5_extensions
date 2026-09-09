import * as React from "react";
import { createRoot } from "react-dom/client";
import { AudioEmbedApp } from "./App";
import { DEFAULT_AUDIO_BASE_URL } from "./constants";

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-audio-embed__mount:not([data-audio-embed-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-audio-embed-initialized", "true");

    const slug = mount.getAttribute("data-slug") || "";
    const audioBaseUrl =
      mount.getAttribute("data-audio-base-url") || DEFAULT_AUDIO_BASE_URL;
    const showErrorCard = mount.getAttribute("data-show-error-card") === "true";

    createRoot(mount).render(
      <AudioEmbedApp
        slug={slug}
        audioBaseUrl={audioBaseUrl}
        showErrorCard={showErrorCard}
      />,
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
