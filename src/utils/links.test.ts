import { isExternalUrl, toHttpUrl } from "./links";

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

  it("ignores a www. prefix", () => {
    const bare = host.replace(/^www\./, "");
    expect(isExternalUrl(`https://www.${bare}/foo/`)).toBe(false);
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

describe("toHttpUrl", () => {
  it("resolves relative and absolute http(s) URLs", () => {
    expect(toHttpUrl("/category/analyse/")?.pathname).toBe(
      "/category/analyse/",
    );
    expect(toHttpUrl("https://pruefpunkt.org/x/")?.host).toBe("pruefpunkt.org");
  });

  it("rejects script and other non-web schemes", () => {
    expect(toHttpUrl("javascript:alert(1)")).toBeNull();
    expect(toHttpUrl(" JavaScript:alert(1)")).toBeNull();
    expect(toHttpUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(toHttpUrl("http://")).toBeNull();
  });
});
