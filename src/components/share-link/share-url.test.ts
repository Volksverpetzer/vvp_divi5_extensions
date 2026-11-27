import { safeShareUrl, displayUrl, qrSvg } from "./share-url";

const FB = "https://volksverpetzer.de/weihnachten/";

describe("safeShareUrl", () => {
  it("keeps http(s) URLs", () => {
    expect(safeShareUrl(" https://volksverpetzer.de/x/ ", FB)).toBe(
      "https://volksverpetzer.de/x/",
    );
    expect(safeShareUrl("HTTP://example.de", FB)).toBe("HTTP://example.de");
  });
  it.each([
    "",
    "javascript:alert(1)",
    "www.example.de",
    "/weihnachten/",
    "data:text/html,x",
  ])("falls back for %j", (raw) => expect(safeShareUrl(raw, FB)).toBe(FB));
});

describe("safeShareUrl with base", () => {
  const BASE = "https://volksverpetzer.de";
  it("resolves a path against the base", () => {
    expect(safeShareUrl(" /spenden/ ", FB, BASE)).toBe(
      "https://volksverpetzer.de/spenden/",
    );
  });
  it("still falls back for protocol-relative URLs", () => {
    expect(safeShareUrl("//evil.example/x", FB, BASE)).toBe(FB);
  });
  it("falls back for a path without base", () => {
    expect(safeShareUrl("/weihnachten/", FB)).toBe(FB);
  });
  it("falls back for whitespace-only input", () => {
    expect(safeShareUrl("   ", FB, BASE)).toBe(FB);
  });
});

describe("displayUrl", () => {
  it("works without a trailing slash", () => {
    expect(displayUrl("https://volksverpetzer.de/x")).toBe(
      "volksverpetzer.de/x",
    );
  });
  // cspell:ignore münchen
  it("decodes umlauts", () => {
    expect(displayUrl("https://volksverpetzer.de/m%C3%BCnchen/")).toBe(
      "volksverpetzer.de/münchen",
    );
  });
  it("keeps malformed encodings", () => {
    expect(displayUrl("https://volksverpetzer.de/%E0%A4%A")).toBe(
      "volksverpetzer.de/%E0%A4%A",
    );
  });
  it("drops scheme and trailing slash", () => {
    expect(displayUrl("https://volksverpetzer.de/weihnachten/")).toBe(
      "volksverpetzer.de/weihnachten",
    );
  });
});

describe("qrSvg", () => {
  it("returns an empty string when the URL is too long", () => {
    expect(qrSvg("https://volksverpetzer.de/" + "a".repeat(5000))).toBe("");
  });
  it("returns an svg", () => {
    const svg = qrSvg(FB);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).not.toContain("<script");
  });
});
