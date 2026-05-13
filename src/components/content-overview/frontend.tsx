import * as React from "react";
import { createRoot } from "react-dom/client";
import { InstagramSlideshow } from "./InstagramSlideshow";
import { PodcastBanner } from "./PodcastBanner";
import { YouTubeBanner, type YouTubeBannerProps } from "./YouTubeBanner";
import { ArticleCard, type ArticleCardProps } from "../shared/ArticleCard";

const initArticleCards = () => {
  const mounts = document.querySelectorAll(
    '.vvp-co-article-mount:not([data-article-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-article-initialized", "true");
    const rawProps = mount.getAttribute("data-article-props");
    if (rawProps) {
      try {
        const props: ArticleCardProps = JSON.parse(rawProps);
        createRoot(mount).render(<ArticleCard {...props} />);
      } catch (e) {
        console.error("Failed to parse article card props", e);
      }
    }
  });
};

const initInstagramSlideshows = () => {
  const mounts = document.querySelectorAll(
    '.vvp-co-ig-mount:not([data-ig-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-ig-initialized", "true");
    const rawProps = mount.getAttribute("data-ig-props");
    if (rawProps) {
      try {
        const props = JSON.parse(rawProps);
        createRoot(mount).render(<InstagramSlideshow {...props} />);
      } catch (e) {
        console.error("Failed to parse Instagram slideshow props", e);
      }
    }
  });
};

const initPodcastBanners = () => {
  const mounts = document.querySelectorAll(
    '.vvp-co-podcast-mount:not([data-podcast-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-podcast-initialized", "true");
    const rawProps = mount.getAttribute("data-podcast-props");
    if (rawProps) {
      try {
        const props = JSON.parse(rawProps);
        createRoot(mount).render(<PodcastBanner {...props} />);
      } catch (e) {
        console.error("Failed to parse podcast banner props", e);
      }
    }
  });
};

const initYouTubeBanners = () => {
  const mounts = document.querySelectorAll(
    '.vvp-co-yt-banner-mount:not([data-yt-banner-initialized="true"])',
  );
  mounts.forEach((mount) => {
    mount.setAttribute("data-yt-banner-initialized", "true");
    const rawProps = mount.getAttribute("data-yt-banner-props");
    if (rawProps) {
      try {
        const props: YouTubeBannerProps = JSON.parse(rawProps);
        createRoot(mount).render(<YouTubeBanner {...props} />);
      } catch (e) {
        console.error("Failed to parse YouTube banner props", e);
      }
    }
  });
};

const LS_KEY = "vvp_co_articles_only";

const applyArticlesFilter = (grid: Element, checked: boolean) => {
  grid.classList.toggle("vvp-co__feed-grid--articles-only", checked);
};

const initArticlesToggle = (wrapper: Element) => {
  const toggle = wrapper.querySelector<HTMLInputElement>(
    ".vvp-co__toggle-input",
  );
  const track = wrapper.querySelector<HTMLElement>(".vvp-co__toggle-track");
  const grid = wrapper.querySelector<HTMLElement>(".vvp-co__feed-grid");
  if (!toggle || !track || !grid) return;

  const apply = (checked: boolean) => {
    toggle.checked = checked;
    track.classList.toggle("is-on", checked);
    applyArticlesFilter(grid, checked);
  };

  let stored = false;
  try {
    stored = localStorage.getItem(LS_KEY) === "true";
  } catch (_) {}
  apply(stored);

  toggle.addEventListener("change", () => {
    try {
      localStorage.setItem(LS_KEY, String(toggle.checked));
    } catch (_) {}
    apply(toggle.checked);
  });
};

const initToggles = () => {
  document
    .querySelectorAll<HTMLElement>(
      ".vvp-co__wrapper:not([data-toggle-initialized])",
    )
    .forEach((wrapper) => {
      wrapper.setAttribute("data-toggle-initialized", "true");
      initArticlesToggle(wrapper);
    });
};

const initAll = () => {
  initArticleCards();
  initInstagramSlideshows();
  initPodcastBanners();
  initYouTubeBanners();
  initToggles();
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
