import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleCard } from "./ArticleCard";

const render = (props: Partial<React.ComponentProps<typeof ArticleCard>>) =>
  renderToStaticMarkup(
    <ArticleCard title="Titel" link="/article/" date="01.10.2026" {...props} />,
  );

describe("ArticleCard link target", () => {
  it("opens internal links in the same tab", () => {
    const html = render({ link: "/article/" });
    expect(html).not.toContain("target=");
    expect(html).not.toContain("rel=");
  });

  it("opens external links in a new tab", () => {
    const html = render({ link: "https://pruefpunkt.org/article/" });
    expect(html).toContain('target="_blank" rel="noopener noreferrer"');
  });

  it("lets an explicit external prop win over the derived value", () => {
    expect(render({ link: "/article/", external: true })).toContain(
      'target="_blank"',
    );
    expect(
      render({ link: "https://pruefpunkt.org/", external: false }),
    ).not.toContain("target=");
  });
});

describe("ArticleCard category link", () => {
  const clickCategory = (category_link: string) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(
        <ArticleCard
          title="Titel"
          link="/article/"
          date="01.10.2026"
          category="Analyse"
          category_link={category_link}
        />,
      );
    });
    act(() => {
      container
        .querySelector<HTMLElement>(".vvp-co__category--btn")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => root.unmount());
    container.remove();
  };

  let assign: ReturnType<typeof vi.spyOn>;
  let open: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    assign = vi.spyOn(window.location, "assign").mockImplementation(() => {});
    open = vi.spyOn(window, "open").mockImplementation(() => null);
  });
  afterEach(() => vi.restoreAllMocks());

  it("navigates internal category links in the same tab", () => {
    clickCategory("/category/analyse/");
    expect(assign).toHaveBeenCalledWith(
      `${window.location.origin}/category/analyse/`,
    );
    expect(open).not.toHaveBeenCalled();
  });

  it("opens external category links in a new tab", () => {
    clickCategory("https://pruefpunkt.org/category/x/");
    expect(open).toHaveBeenCalledWith(
      "https://pruefpunkt.org/category/x/",
      "_blank",
      "noopener,noreferrer",
    );
    expect(assign).not.toHaveBeenCalled();
  });

  it("never navigates to javascript: URLs", () => {
    clickCategory("javascript:alert(1)");
    expect(assign).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });
});

describe("ArticleCard hero variant", () => {
  const props = {
    title: "Titel",
    link: "/article/",
    date: "01.10.2026",
    image_url: "https://example.org/image.jpg",
  };

  it("renders feed cards with a lazy image and an h3", () => {
    const html = renderToStaticMarkup(<ArticleCard {...props} />);
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("fetchpriority");
    expect(html).toContain("<h3 ");
    expect(html).not.toContain("vvp-co__feed-card--hero");
  });

  it("renders the hero with an eager, high-priority image and an h2", () => {
    const html = renderToStaticMarkup(<ArticleCard {...props} hero />);
    // HTML attribute names are case-insensitive; React serialises
    // fetchPriority with its camelCase name, PHP writes lowercase.
    const img = html.match(/<img[^>]*>/)![0].toLowerCase();
    expect(img).toContain('loading="eager"');
    expect(img).toContain('fetchpriority="high"');
    expect(html).toContain("<h2 ");
    expect(html).toContain("vvp-co__feed-card--hero");
  });
});
