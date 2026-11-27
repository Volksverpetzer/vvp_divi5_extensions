import * as React from "react";
import { createRoot } from "react-dom/client";
import { ShareLinkApp } from "./App";
import { safeShareUrl } from "./share-url";
import { DEFAULT_QR_LABEL, DEFAULT_TITLE } from "./constants";

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-share-link__mount:not([data-share-link-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-share-link-initialized", "true");

    const title = mount.getAttribute("data-title") || DEFAULT_TITLE;
    const text = mount.getAttribute("data-text") || "";
    const qrLabel = mount.getAttribute("data-qr-label") || DEFAULT_QR_LABEL;
    const url = safeShareUrl(
      mount.getAttribute("data-url") || "",
      window.location.origin + window.location.pathname,
    );

    createRoot(mount).render(
      <ShareLinkApp title={title} text={text} url={url} qrLabel={qrLabel} />,
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
