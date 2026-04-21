import * as React from "react";
import { createRoot } from "react-dom/client";
import { AuthorProfileApp } from "./App";
import { type Author, type Layout } from "./types";

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-ap__mount:not([data-ap-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-ap-initialized", "true");

    let authors: Author[] = [];
    try {
      authors = JSON.parse(mount.getAttribute("data-authors") || "[]");
    } catch {
      authors = [];
    }

    const showAvatar = mount.getAttribute("data-show-avatar") !== "false";
    const showBio = mount.getAttribute("data-show-bio") !== "false";
    const showLink = mount.getAttribute("data-show-link") !== "false";
    const layout = (mount.getAttribute("data-layout") || "vertical") as Layout;
    const avatarSize =
      parseInt(mount.getAttribute("data-avatar-size") || "200", 10) || 200;

    createRoot(mount).render(
      <AuthorProfileApp
        authors={authors}
        showAvatar={showAvatar}
        showBio={showBio}
        showLink={showLink}
        layout={layout}
        avatarSize={avatarSize}
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
