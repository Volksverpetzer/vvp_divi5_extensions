import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TrendingListApp } from "./App";

const item = (link: string) => ({
  title: "Titel",
  link,
  date: "01.10.2026",
  authors: ["Minka Fellstein"],
});

describe("TrendingListApp link target", () => {
  it("opens same-site links in the same tab", () => {
    const html = renderToStaticMarkup(
      <TrendingListApp items={[item(`${window.location.origin}/article/`)]} />,
    );
    expect(html).not.toContain("target=");
  });

  it("opens external links in a new tab", () => {
    const html = renderToStaticMarkup(
      <TrendingListApp items={[item("https://pruefpunkt.org/article/")]} />,
    );
    expect(html).toContain('target="_blank" rel="noopener noreferrer"');
  });
});
