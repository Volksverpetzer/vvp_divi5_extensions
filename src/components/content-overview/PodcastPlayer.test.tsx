import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PodcastPlayer } from "./PodcastPlayer";
import { PodcastBanner } from "./PodcastBanner";

vi.mock("../../utils/plausible", () => ({ trackEvent: vi.fn() }));

const SRC = "https://example.org/episode.mp3";

// happy-dom doesn't decode audio, so play()/pause() are stubbed to flip a
// per-element `paused` flag and fire the events a real browser would. A
// test can make play() reject (what a refused autoplay looks like) via
// `playResult`.
const pausedState = new WeakMap<HTMLMediaElement, boolean>();
let playResult: () => Promise<void> = () => Promise.resolve();

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "paused", {
    configurable: true,
    get(this: HTMLMediaElement) {
      return pausedState.get(this) ?? true;
    },
  });
});

beforeEach(() => {
  playResult = () => Promise.resolve();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    return playResult().then(() => {
      pausedState.set(this, false);
      this.dispatchEvent(new Event("play"));
      this.dispatchEvent(new Event("playing"));
    });
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    pausedState.set(this, true);
    this.dispatchEvent(new Event("pause"));
  });
});

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

const flush = () => act(() => Promise.resolve());

const audio = () =>
  container.querySelector<HTMLAudioElement>(".vvp-co__podcast-player audio");
const playButton = () =>
  container.querySelector<HTMLButtonElement>(".vvp-co__podcast-player-btn")!;
const slider = () =>
  container.querySelector<HTMLInputElement>(
    ".vvp-co__podcast-player input[type=range]",
  )!;
const times = () =>
  [...container.querySelectorAll(".vvp-co__podcast-player-time")].map(
    (el) => el.textContent,
  );

/** Pretend the browser has loaded metadata / advanced playback. */
const setMediaProp = (
  el: HTMLMediaElement,
  prop: "duration" | "currentTime",
  value: number,
  event: string,
) => {
  Object.defineProperty(el, prop, {
    configurable: true,
    writable: true,
    value,
  });
  act(() => {
    el.dispatchEvent(new Event(event));
  });
};

describe("PodcastPlayer", () => {
  it("starts playback on mount and shows the pause button", async () => {
    act(() => root.render(<PodcastPlayer src={SRC} />));
    await flush();

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    expect(audio()!.getAttribute("src")).toBe(SRC);
    expect(playButton().getAttribute("aria-label")).toBe("Pause");
    expect(
      container.querySelector(".vvp-co__podcast-player-spinner"),
    ).toBeNull();
  });

  it("stays paused with a usable play button when autoplay is refused", async () => {
    playResult = () => Promise.reject(new DOMException("", "NotAllowedError"));
    act(() => root.render(<PodcastPlayer src={SRC} />));
    await flush();

    expect(playButton().getAttribute("aria-label")).toBe("Abspielen");

    playResult = () => Promise.resolve();
    act(() => playButton().click());
    await flush();
    expect(playButton().getAttribute("aria-label")).toBe("Pause");
  });

  it("toggles between pause and play", async () => {
    act(() => root.render(<PodcastPlayer src={SRC} />));
    await flush();

    act(() => playButton().click());
    await flush();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    expect(playButton().getAttribute("aria-label")).toBe("Abspielen");

    act(() => playButton().click());
    await flush();
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(playButton().getAttribute("aria-label")).toBe("Pause");
  });

  it("shows a spinner while buffering", async () => {
    act(() => root.render(<PodcastPlayer src={SRC} />));
    await flush();

    act(() => {
      audio()!.dispatchEvent(new Event("waiting"));
    });
    expect(
      container.querySelector(".vvp-co__podcast-player-spinner"),
    ).not.toBeNull();

    act(() => {
      audio()!.dispatchEvent(new Event("canplay"));
    });
    expect(
      container.querySelector(".vvp-co__podcast-player-spinner"),
    ).toBeNull();
  });

  it("shows elapsed/total time and keeps the slider disabled until the duration is known", async () => {
    act(() => root.render(<PodcastPlayer src={SRC} />));
    await flush();

    expect(slider().disabled).toBe(true);
    expect(times()).toEqual(["0:00", "0:00"]);

    setMediaProp(audio()!, "duration", 1834, "loadedmetadata");
    setMediaProp(audio()!, "currentTime", 65, "timeupdate");

    expect(slider().disabled).toBe(false);
    expect(slider().max).toBe("1834");
    expect(times()).toEqual(["1:05", "30:34"]);
  });

  it("treats an Infinity duration (live/unknown length) as not yet known", async () => {
    act(() => root.render(<PodcastPlayer src={SRC} />));
    await flush();

    setMediaProp(audio()!, "duration", Infinity, "durationchange");
    expect(slider().max).toBe("100");
    expect(times()[1]).toBe("0:00");
  });

  it("seeks when the slider moves", async () => {
    act(() => root.render(<PodcastPlayer src={SRC} />));
    await flush();
    setMediaProp(audio()!, "duration", 600, "loadedmetadata");

    const input = slider();
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, "120");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(audio()!.currentTime).toBe(120);
    expect(times()[0]).toBe("2:00");
  });

  it("calls onEnded when the episode finishes", async () => {
    const onEnded = vi.fn();
    act(() => root.render(<PodcastPlayer src={SRC} onEnded={onEnded} />));
    await flush();

    act(() => {
      audio()!.dispatchEvent(new Event("ended"));
    });
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(playButton().getAttribute("aria-label")).toBe("Abspielen");
  });
});

describe("PodcastBanner with PodcastPlayer", () => {
  const bannerProps = {
    title: "Folge 1",
    link: "https://example.org/folge-1",
    enclosure: SRC,
    date: "3. Mai 2026",
    summary: "",
    artworkUrl: "",
  };

  const listenButtons = () =>
    [
      ...container.querySelectorAll<HTMLButtonElement>(
        ".vvp-co__podcast-listen-btn",
      ),
    ].filter((b) => b.textContent?.includes("Anhören"));
  const closeButton = () =>
    container.querySelector<HTMLButtonElement>(
      ".vvp-co__podcast-listen-btn--stop",
    );
  const wraps = () => [
    ...container.querySelectorAll<HTMLElement>(".vvp-co__podcast-player-wrap"),
  ];
  const animationEnd = (el: Element) =>
    act(() => {
      el.dispatchEvent(new Event("animationend", { bubbles: true }));
    });

  it("animates the player open on Anhören", async () => {
    act(() => root.render(<PodcastBanner {...bannerProps} />));
    expect(audio()).toBeNull();

    act(() => listenButtons()[0].click());
    await flush();
    expect(audio()).not.toBeNull();
    expect(wraps()[0].className).toContain(
      "vvp-co__podcast-player-wrap--opening",
    );

    animationEnd(wraps()[0]);
    expect(wraps()[0].className).toContain("vvp-co__podcast-player-wrap--open");
    expect(wraps()[0].className).not.toContain("--opening");
  });

  it("pauses at once on Schließen and removes the player after the close animation", async () => {
    act(() => root.render(<PodcastBanner {...bannerProps} />));
    act(() => listenButtons()[0].click());
    await flush();
    animationEnd(wraps()[0]);

    expect(closeButton()!.textContent).toContain("Schließen");
    act(() => closeButton()!.click());

    // Still mounted while it animates out, but already paused, and the
    // footer is back to "Anhören".
    expect(audio()).not.toBeNull();
    expect(audio()!.paused).toBe(true);
    expect(wraps()[0].className).toContain(
      "vvp-co__podcast-player-wrap--closing",
    );
    expect(listenButtons()).toHaveLength(1);

    // An animationend bubbling up from a child must not end it early.
    animationEnd(slider());
    expect(audio()).not.toBeNull();

    animationEnd(wraps()[0]);
    expect(audio()).toBeNull();
  });

  it("falls back to a timeout when animationend never fires (reduced motion)", async () => {
    vi.useFakeTimers();
    try {
      act(() => root.render(<PodcastBanner {...bannerProps} />));
      act(() => listenButtons()[0].click());
      await flush();
      act(() => vi.advanceTimersByTime(400));
      expect(wraps()[0].className).toContain(
        "vvp-co__podcast-player-wrap--open",
      );

      act(() => closeButton()!.click());
      act(() => vi.advanceTimersByTime(399));
      expect(audio()).not.toBeNull();
      act(() => vi.advanceTimersByTime(1));
      expect(audio()).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("mounts a fresh, playing player when re-opened during the close animation", async () => {
    act(() => root.render(<PodcastBanner {...bannerProps} />));
    act(() => listenButtons()[0].click());
    await flush();
    const firstAudio = audio();
    act(() => closeButton()!.click());

    act(() => listenButtons()[0].click());
    await flush();
    expect(wraps()).toHaveLength(1);
    expect(audio()).not.toBe(firstAudio);
    expect(audio()!.paused).toBe(false);
    expect(wraps()[0].className).toContain(
      "vvp-co__podcast-player-wrap--opening",
    );
  });

  it("closes the player when the episode ends", async () => {
    act(() => root.render(<PodcastBanner {...bannerProps} />));
    act(() => listenButtons()[0].click());
    await flush();

    act(() => {
      audio()!.dispatchEvent(new Event("ended"));
    });
    expect(wraps()[0].className).toContain(
      "vvp-co__podcast-player-wrap--closing",
    );
    animationEnd(wraps()[0]);
    expect(audio()).toBeNull();
  });

  it("stops one banner's player when another banner starts playing", async () => {
    act(() =>
      root.render(
        <>
          <PodcastBanner {...bannerProps} />
          <PodcastBanner {...bannerProps} title="Folge 2" />
        </>,
      ),
    );

    act(() => listenButtons()[0].click());
    await flush();
    const firstAudio = audio()!;

    // Banner 1's "Anhören" is hidden while it plays, so banner 2's is
    // the only one left.
    expect(listenButtons()).toHaveLength(1);
    act(() => listenButtons()[0].click());
    await flush();
    expect(firstAudio.paused).toBe(true);
    const [first, second] = wraps();
    expect(first.className).toContain("vvp-co__podcast-player-wrap--closing");
    expect(second.className).toContain("vvp-co__podcast-player-wrap--opening");

    animationEnd(first);
    const remaining = wraps();
    expect(remaining).toHaveLength(1);
    // The surviving player belongs to the second banner.
    expect(
      remaining[0]
        .closest(".vvp-co__podcast-banner")!
        .querySelector(".vvp-co__podcast-title")!.textContent,
    ).toBe("Folge 2");
  });
});
