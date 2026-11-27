import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ShareLinkApp } from "./App";

const URL_FULL = "https://volksverpetzer.de/weihnachten/";
const TITLE = '<b>Hi</b> "x"';
const TEXT = "Mach mit";

let container: HTMLDivElement;
let root: Root;
let plausible: ReturnType<typeof vi.fn> & NonNullable<Window["plausible"]>;

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

const mount = async (
  props: Partial<React.ComponentProps<typeof ShareLinkApp>> = {},
) => {
  await act(async () => {
    root.render(
      <ShareLinkApp
        title={TITLE}
        text={TEXT}
        url={URL_FULL}
        qrLabel="Scan mit dem Handy"
        {...props}
      />,
    );
  });
};

const button = (label: string) =>
  Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent === label,
  );

const status = () =>
  container.querySelector(".vvp-share-link__status")?.textContent ?? "";

const stubNavigator = (key: string, value: unknown) =>
  Object.defineProperty(navigator, key, { value, configurable: true });

beforeEach(() => {
  vi.useFakeTimers();
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  plausible = vi.fn() as typeof plausible;
  window.plausible = plausible;
  stubNavigator("share", undefined);
  stubNavigator("clipboard", undefined);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  delete window.plausible;
  vi.useRealTimers();
});

describe("ShareLinkApp", () => {
  it("omits the QR block when the link is too long for a QR code", async () => {
    await mount({ url: URL_FULL + "a".repeat(5000) });
    expect(container.querySelector(".vvp-share-link__qr")).toBeNull();
    expect(container.querySelector(".vvp-share-link__title")).not.toBeNull();
  });
  it("renders title, text and url as plain text", async () => {
    await mount();
    const title = container.querySelector(".vvp-share-link__title");
    expect(title?.innerHTML).toContain("&lt;b&gt;");
    expect(title?.textContent).toBe(TITLE);
    expect(container.querySelector(".vvp-share-link__text")?.textContent).toBe(
      TEXT,
    );
    const a = container.querySelector<HTMLAnchorElement>(
      "a.vvp-share-link__url",
    );
    expect(a?.getAttribute("href")).toBe(URL_FULL);
    expect(a?.textContent).toBe("volksverpetzer.de/weihnachten");
  });

  it("omits the text paragraph when empty", async () => {
    await mount({ text: "" });
    expect(container.querySelector(".vvp-share-link__text")).toBeNull();
  });

  it("contains the QR svg", async () => {
    await mount();
    expect(container.querySelector(".vvp-share-link__qr svg")).not.toBeNull();
    expect(
      container.querySelector(".vvp-share-link__qr-label")?.textContent,
    ).toBe("Scan mit dem Handy");
  });

  it("hides Teilen without navigator.share", async () => {
    await mount();
    expect(button("Teilen")).toBeUndefined();
    expect(button("Link kopieren")).toBeDefined();
  });

  it("shares via navigator.share", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    stubNavigator("share", share);
    await mount();
    await act(async () => {
      button("Teilen")!.click();
    });
    await flush();
    expect(share).toHaveBeenCalledWith({
      title: TITLE,
      text: TEXT,
      url: URL_FULL,
    });
    expect(plausible).toHaveBeenCalledWith("Link Shared", {
      props: { method: "native-share", url: URL_FULL },
    });
  });

  it("cancelled share is silent", async () => {
    stubNavigator(
      "share",
      vi.fn().mockRejectedValue(new DOMException("", "AbortError")),
    );
    await mount();
    await act(async () => {
      button("Teilen")!.click();
    });
    await flush();
    expect(status()).toBe("");
    expect(plausible).not.toHaveBeenCalled();
  });

  it("copies the link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator("clipboard", { writeText });
    await mount();
    await act(async () => {
      button("Link kopieren")!.click();
    });
    await flush();
    expect(writeText).toHaveBeenCalledWith(URL_FULL);
    expect(status()).toBe("Link kopiert!");
    expect(plausible).toHaveBeenCalledWith("Link Copied", {
      props: { location: "share", url: URL_FULL },
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(status()).toBe("");
  });

  it("copy failure shows an error", async () => {
    await mount();
    await act(async () => {
      button("Link kopieren")!.click();
    });
    await flush();
    expect(status()).toBe("Konnte Link nicht kopieren.");
    expect(plausible).not.toHaveBeenCalled();
  });

  it("track={false} sends no events", async () => {
    stubNavigator("share", vi.fn().mockResolvedValue(undefined));
    stubNavigator("clipboard", {
      writeText: vi.fn().mockResolvedValue(undefined),
    });
    await mount({ track: false });
    await act(async () => {
      button("Teilen")!.click();
    });
    await flush();
    await act(async () => {
      button("Link kopieren")!.click();
    });
    await flush();
    expect(plausible).not.toHaveBeenCalled();
  });
});
