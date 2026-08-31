import * as React from "react";
import { createRoot } from "react-dom/client";
import { CtaBoxApp } from "./App";
import { type CtaBoxIcon, type CtaBoxVariant } from "./types";
import { DEFAULT_ICON, DEFAULT_VARIANT } from "./constants";

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-cta-box__mount:not([data-cta-box-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-cta-box-initialized", "true");

    const icon = (mount.getAttribute("data-icon") ||
      DEFAULT_ICON) as CtaBoxIcon;
    const heading = mount.getAttribute("data-heading") || "";
    const text = mount.getAttribute("data-text") || "";
    const buttonLabel = mount.getAttribute("data-button-label") || "";
    const buttonUrl = mount.getAttribute("data-button-url") || "";
    const buttonNewTab = mount.getAttribute("data-button-new-tab") === "true";
    const variant = (mount.getAttribute("data-variant") ||
      DEFAULT_VARIANT) as CtaBoxVariant;

    createRoot(mount).render(
      <CtaBoxApp
        icon={icon}
        heading={heading}
        text={text}
        buttonLabel={buttonLabel}
        buttonUrl={buttonUrl}
        buttonNewTab={buttonNewTab}
        variant={variant}
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
