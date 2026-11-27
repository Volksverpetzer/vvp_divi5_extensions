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

describe("displayUrl", () => {
  it("drops scheme and trailing slash", () => {
    expect(displayUrl("https://volksverpetzer.de/weihnachten/")).toBe(
      "volksverpetzer.de/weihnachten",
    );
  });
});

describe("qrSvg", () => {
  it("returns an svg", () => {
    const svg = qrSvg(FB);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).not.toContain("<script");
  });
});
