import { isExternalUrl } from "./links";

describe("isExternalUrl", () => {
  const host = window.location.host;

  it("treats relative URLs and fragments as internal", () => {
    expect(isExternalUrl("/category/analyse/")).toBe(false);
    expect(isExternalUrl("#")).toBe(false);
  });

  it("treats same-host absolute URLs as internal", () => {
    expect(isExternalUrl(`${window.location.protocol}//${host}/foo/`)).toBe(
      false,
    );
  });

  it("treats other hosts as external", () => {
    expect(isExternalUrl("https://pruefpunkt.org/article/")).toBe(true);
    expect(isExternalUrl("https://www.youtube.com/watch?v=abc")).toBe(true);
  });

  it("treats non-http(s) and unparsable URLs as internal", () => {
    expect(isExternalUrl("mailto:info@example.org")).toBe(false);
    expect(isExternalUrl("http://")).toBe(false);
  });
});
