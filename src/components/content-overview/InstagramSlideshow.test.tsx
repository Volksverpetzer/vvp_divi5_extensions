import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import {
  IMAGE_LOAD_TIMEOUT_MS,
  InstagramSlideshow,
} from "./InstagramSlideshow";

// Preloads go through `new Image()`; this stand-in records each request and
// lets a test decide whether (and when) it loads, errors or never answers —
// the last being what a hanging media proxy looks like.
class FakeImage {
  static requests: FakeImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = "";
  constructor() {
    FakeImage.requests.push(this);
  }
}

const slides = [
  { thumb: "https://example.org/a.jpg", video: "" },
  { thumb: "https://example.org/b.jpg", video: "" },
  { thumb: "https://example.org/c.jpg", video: "" },
];

const props = {
  permalink: "https://www.instagram.com/p/ABC/",
  postId: "",
  caption: "Bildunterschrift",
  date: "01.10.2026",
  badgeLabel: "Instagram",
  slides,
  isCarousel: true,
};

const FALLBACK_TEXT = "Bild nicht verfügbar";

describe("InstagramSlideshow footer", () => {
  it("keeps the badge left and right-aligns date | copy link", () => {
    const html = renderToStaticMarkup(<InstagramSlideshow {...props} />);
    const footer = html.slice(
      html.indexOf('<div class="vvp-co__feed-footer">'),
    );
    const meta = footer.slice(
      footer.indexOf('<span class="vvp-co__feed-footer-meta">'),
    );
    expect(footer.indexOf("Instagram")).toBeLessThan(
      footer.indexOf("vvp-co__feed-footer-meta"),
    );
    expect(meta).toMatch(
      /^<span class="vvp-co__feed-footer-meta"><span class="vvp-ui-meta-text vvp-co__feed-date"[^>]*>01\.10\.2026<\/span><span class="vvp-co__feed-footer-sep" aria-hidden="true">\|<\/span><span role="button"[^>]*vvp-co__copy-link-btn/,
    );
  });
});

describe("InstagramSlideshow image loading", () => {
  let container: HTMLDivElement;
  let root: Root;
  const OriginalImage = globalThis.Image;

  beforeEach(() => {
    vi.useFakeTimers();
    FakeImage.requests = [];
    globalThis.Image = FakeImage as unknown as typeof Image;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<InstagramSlideshow {...props} />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    globalThis.Image = OriginalImage;
    vi.useRealTimers();
  });

  const request = (src: string) =>
    FakeImage.requests.find((r) => r.src === src)!;
  const firstSlide = () =>
    container.querySelector(".vvp-co-slide") as HTMLElement;

  it("shows the image once it has loaded", () => {
    act(() => request(slides[0].thumb).onload!());
    expect(firstSlide().querySelector("img")?.getAttribute("src")).toBe(
      slides[0].thumb,
    );
    act(() => vi.advanceTimersByTime(IMAGE_LOAD_TIMEOUT_MS));
    expect(firstSlide().textContent).not.toContain(FALLBACK_TEXT);
  });

  it("shows the fallback when the image fails to load", () => {
    act(() => request(slides[0].thumb).onerror!());
    expect(firstSlide().textContent).toContain(FALLBACK_TEXT);
  });

  it("falls back instead of loading forever when the request never settles", () => {
    act(() => vi.advanceTimersByTime(IMAGE_LOAD_TIMEOUT_MS - 1));
    expect(firstSlide().textContent).not.toContain(FALLBACK_TEXT);
    expect(
      firstSlide().querySelector(".vvp-co__ig-loading-placeholder"),
    ).not.toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(firstSlide().textContent).toContain(FALLBACK_TEXT);
    expect(
      firstSlide().querySelector(".vvp-co__ig-loading-placeholder"),
    ).toBeNull();
  });

  it("still shows an image that arrives after the timeout", () => {
    act(() => vi.advanceTimersByTime(IMAGE_LOAD_TIMEOUT_MS));
    act(() => request(slides[0].thumb).onload!());
    expect(firstSlide().querySelector("img")).not.toBeNull();
    expect(firstSlide().textContent).not.toContain(FALLBACK_TEXT);
  });

  it("requests each slide image once, however often the state changes", () => {
    // The current slide and its neighbour.
    expect(FakeImage.requests.map((r) => r.src)).toEqual([
      slides[0].thumb,
      slides[1].thumb,
    ]);
    act(() => request(slides[1].thumb).onerror!());
    act(() => vi.advanceTimersByTime(IMAGE_LOAD_TIMEOUT_MS));
    act(() => request(slides[0].thumb).onload!());
    expect(FakeImage.requests).toHaveLength(2);
  });

  it("shares the requests and their state with the fullscreen view", () => {
    const open = container.querySelector(
      '[aria-label="Vollbild öffnen"]',
    ) as HTMLElement;
    act(() => open.click());
    const shown = () => document.querySelectorAll(".vvp-co-active-slide");
    expect(shown()).toHaveLength(2);
    // The fullscreen slider doesn't request the images again…
    expect(FakeImage.requests).toHaveLength(2);

    // …and shows the same state as the card: fallback after the timeout,
    // the image once it arrives.
    act(() => vi.advanceTimersByTime(IMAGE_LOAD_TIMEOUT_MS));
    shown().forEach((slide) =>
      expect(slide.textContent).toContain(FALLBACK_TEXT),
    );
    act(() => request(slides[0].thumb).onload!());
    shown().forEach((slide) =>
      expect(slide.querySelector("img")).not.toBeNull(),
    );
    expect(FakeImage.requests).toHaveLength(2);
  });

  it("doesn't carry a slide's state over to a new image at the same index", () => {
    act(() => request(slides[0].thumb).onerror!());
    expect(firstSlide().textContent).toContain(FALLBACK_TEXT);

    const replaced = [
      { thumb: "https://example.org/new.jpg", video: "" },
      ...slides.slice(1),
    ];
    act(() => root.render(<InstagramSlideshow {...props} slides={replaced} />));
    // The new image is requested and loads on its own, not stuck on the
    // old one's fallback.
    expect(firstSlide().textContent).not.toContain(FALLBACK_TEXT);
    act(() => request(replaced[0].thumb).onload!());
    expect(firstSlide().querySelector("img")?.getAttribute("src")).toBe(
      replaced[0].thumb,
    );
  });

  it("aborts requests that are still pending on unmount", () => {
    const pending = request(slides[0].thumb);
    act(() => root.unmount());
    expect(pending.src).toBe("");
    expect(pending.onload).toBeNull();
    expect(pending.onerror).toBeNull();
    // afterEach unmounts again; give it a fresh root.
    root = createRoot(container);
  });
});
