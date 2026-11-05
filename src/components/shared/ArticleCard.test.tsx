import * as React from "react";
import { act } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleCard, unwrapImageLinks } from "./ArticleCard";

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

  it("shows the image credit on the hero only (ISC's show-source)", () => {
    const hero = renderToStaticMarkup(<ArticleCard {...props} hero />);
    expect(hero).toMatch(/<a [^>]*class="[^"]*\bshow-source\b/);
    const feed = renderToStaticMarkup(<ArticleCard {...props} />);
    expect(feed).not.toContain("show-source");
  });
});

describe("ArticleCard byline", () => {
  const props = {
    title: "Titel",
    link: "/article/",
    date: "01.10.2026",
    excerpt: "Auszug",
    author: "Anna und Ben",
    category: "Analyse",
    reading_time: 4,
  };

  const meta =
    '<span class="vvp-ui-badge vvp-ui-badge--primary vvp-ui-badge--size-md vvp-co__category">Analyse</span><span class="vvp-co__feed-footer-meta"><span class="vvp-ui-meta-text vvp-co__feed-date">01.10.2026</span><span class="vvp-co__feed-footer-sep" aria-hidden="true">|</span><span class="vvp-ui-meta-text vvp-co__feed-reading-time">';
  const authors =
    '<span class="vvp-co__feed-byline-author">von Anna und Ben</span>';

  it("stacks feed cards as title, authors, excerpt, meta footer", () => {
    const html = renderToStaticMarkup(<ArticleCard {...props} />);
    expect(html).toContain(
      `</h3><div class="vvp-co__feed-byline">${authors}</div><p class="vvp-co__feed-excerpt">Auszug</p><div class="vvp-co__feed-footer">${meta}`,
    );
    expect(html).toMatch(/4 Min\.<\/span><\/span><\/div><\/div><\/a>$/);
  });

  it("stacks the hero like feed cards: title, authors, excerpt, meta footer", () => {
    const html = renderToStaticMarkup(<ArticleCard {...props} hero />);
    expect(html).toContain(
      `</h2><div class="vvp-co__feed-byline">${authors}</div><p class="vvp-co__feed-excerpt">Auszug</p><div class="vvp-co__feed-footer">${meta}`,
    );
  });

  it("leaves out the feed card's byline when there are no authors", () => {
    const html = renderToStaticMarkup(
      <ArticleCard {...props} author={undefined} />,
    );
    expect(html).not.toContain("vvp-co__feed-byline");
    expect(html).toContain(`<div class="vvp-co__feed-footer">${meta}`);
  });

  it("renders a linked category as a focusable badge button", () => {
    const html = renderToStaticMarkup(
      <ArticleCard {...props} category_link="/category/analyse/" />,
    );
    expect(html).toContain(
      '<span class="vvp-ui-badge vvp-ui-badge--primary vvp-ui-badge--size-md vvp-co__category vvp-co__category--btn" role="button" tabindex="0">Analyse</span>',
    );
  });

  it("leaves out the separator when there is no reading time", () => {
    const html = renderToStaticMarkup(
      <ArticleCard {...props} reading_time={0} />,
    );
    expect(html).not.toContain("vvp-co__feed-footer-sep");
    expect(html).toContain(
      '<span class="vvp-co__feed-footer-meta"><span class="vvp-ui-meta-text vvp-co__feed-date">01.10.2026</span></span>',
    );
  });

  it("puts the Prüfpunkt badge left and its category before the date", () => {
    const html = renderToStaticMarkup(
      <ArticleCard
        {...props}
        source="pruefpunkt"
        category_link="https://pruefpunkt.org/category/analyse/"
      />,
    );
    expect(html).toContain(
      '<div class="vvp-co__feed-footer"><span class="vvp-ui-badge vvp-ui-badge--pruefpunkt vvp-ui-badge--size-md">Prüfpunkt</span><span class="vvp-co__feed-footer-meta"><span class="vvp-co__category vvp-co__category--btn" role="button" tabindex="0">Analyse</span><span class="vvp-co__feed-footer-sep" aria-hidden="true">|</span><span class="vvp-ui-meta-text vvp-co__feed-date">01.10.2026</span>',
    );
    expect(html).not.toContain("vvp-ui-badge--primary");
  });
});

describe("ArticleCard hydration with rewritten image markup", () => {
  const props = {
    title: "Titel",
    link: "/article/",
    date: "01.10.2026",
    image_url: "https://example.org/image.jpg",
    hero: true,
  };

  it("keeps an image credit added after server rendering", async () => {
    // What Image Source Control does to the server-rendered <img>.
    const serverHtml = renderToStaticMarkup(<ArticleCard {...props} />).replace(
      /(<img[^>]*>)/,
      '<span class="isc-source">$1<span class="isc-source-text">© dpa</span></span>',
    );
    const mount = document.createElement("div");
    mount.innerHTML = serverHtml;
    document.body.appendChild(mount);

    const imageHtml = mount.querySelector(
      ":scope > a > .vvp-co__feed-image-wrap",
    )!.innerHTML;
    const errors: unknown[] = [];
    await act(async () => {
      hydrateRoot(mount, <ArticleCard {...props} imageHtml={imageHtml} />, {
        onRecoverableError: (e) => errors.push(e),
      });
    });

    expect(errors).toEqual([]);
    expect(mount.querySelector(".isc-source-text")?.textContent).toBe("© dpa");
    mount.remove();
  });

  it("restores a card the parser split at a linked credit", async () => {
    // How the HTML parser reads a card whose credit links to its source
    // (parse5, per the spec): the card link ends before the image wrapper,
    // a copy of it wraps the image, and the credit link moved out of the
    // credit.
    // A feed card: the hero also renders a preload <link> before the card.
    const feedProps = { ...props, hero: false };
    const mount = document.createElement("div");
    mount.innerHTML = renderToStaticMarkup(
      <ArticleCard {...feedProps} />,
    ).replace(
      /^(<a [^>]*>)<div class="vvp-co__feed-image-wrap">(<img[^>]*>)<\/div>(.*)<\/a>$/,
      '$1</a><div class="vvp-co__feed-image-wrap">$1<span class="isc-source">$2<span class="isc-source-text">© </span></span></a><a href="https://example.org/source">dpa</a></div>$3',
    );
    document.body.appendChild(mount);
    expect(mount.querySelectorAll(":scope > a")).toHaveLength(1);

    const wrap = mount.querySelector(".vvp-co__feed-image-wrap")!;
    unwrapImageLinks(wrap);
    expect(wrap.querySelector("a")).toBeNull();
    expect(wrap.querySelector(".isc-source-text")?.textContent).toBe("© dpa");

    const imageHtml = wrap.innerHTML;
    await act(async () => {
      // The split markup can't hydrate; React re-renders it on the client.
      hydrateRoot(mount, <ArticleCard {...feedProps} imageHtml={imageHtml} />, {
        onRecoverableError: () => {},
      });
    });

    const card = mount.querySelector(":scope > a")!;
    expect(mount.children).toHaveLength(1);
    expect(card.querySelector(".vvp-co__feed-title")?.textContent).toBe(
      "Titel",
    );
    expect(card.querySelector(".isc-source-text")?.textContent).toBe("© dpa");
    expect(card.querySelector("a")).toBeNull();
    mount.remove();
  });

  it("leaves unlinked image markup as it is", () => {
    const wrap = document.createElement("div");
    wrap.innerHTML =
      '<span class="isc-source"><img src="i.jpg"><span class="isc-source-text">© dpa</span></span>';
    const before = wrap.innerHTML;
    unwrapImageLinks(wrap);
    expect(wrap.innerHTML).toBe(before);
  });
});

describe("ArticleCard image credit badge", () => {
  const props = {
    title: "Titel",
    link: "/article/",
    date: "01.10.2026",
    image_url: "https://example.org/image.jpg",
    image_credit: {
      source: "dpa / Max Muster",
      source_url: "https://example.org/source",
      licence: "CC BY 2.0",
    },
  };

  // CardRenderTrait.php's $credit_html (with INFO_ICON_SVG), verbatim.
  const PHP_BADGE =
    '<span class="vvp-co__credit"><span class="vvp-co__credit-btn" role="button" tabindex="0" aria-label="Bildquelle anzeigen" aria-expanded="false">' +
    '<svg aria-hidden="true" focusable="false" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>' +
    "</span></span>";

  it("renders the same closed badge as PHP, right after the image", () => {
    const html = renderToStaticMarkup(<ArticleCard {...props} />);
    expect(html).toContain(`</div>${PHP_BADGE}<div class="vvp-co__feed-body">`);
  });

  it("is left out on the hero and without a credit or image", () => {
    expect(renderToStaticMarkup(<ArticleCard {...props} hero />)).not.toContain(
      "vvp-co__credit",
    );
    expect(
      renderToStaticMarkup(<ArticleCard {...props} image_credit={undefined} />),
    ).not.toContain("vvp-co__credit");
    expect(
      renderToStaticMarkup(<ArticleCard {...props} image_url={undefined} />),
    ).not.toContain("vvp-co__credit");
  });

  const mountCard = (
    cardProps: React.ComponentProps<typeof ArticleCard> = props,
  ) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(<ArticleCard {...cardProps} />));
    const button = container.querySelector<HTMLElement>(".vvp-co__credit-btn")!;
    const cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };
    return { container, button, cleanup };
  };

  const click = (el: Element) => {
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    act(() => {
      el.dispatchEvent(event);
    });
    return event;
  };

  afterEach(() => vi.restoreAllMocks());

  it("opens the credit without following the card link", () => {
    const { container, button, cleanup } = mountCard();
    const event = click(button);

    expect(event.defaultPrevented).toBe(true);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const popover = container.querySelector(".vvp-co__credit-popover")!;
    expect(button.getAttribute("aria-controls")).toBe(popover.id);
    expect(popover.textContent).toContain("dpa / Max Muster");
    expect(popover.textContent).toContain("CC BY 2.0");

    // Clicks on the popover's text don't follow the card link either.
    expect(click(popover).defaultPrevented).toBe(true);
    cleanup();
  });

  it("gives popovers in separately hydrated cards distinct ids", () => {
    const first = mountCard();
    const second = mountCard();
    click(first.button);
    click(second.button);
    const firstId = first.button.getAttribute("aria-controls");
    expect(firstId).toBeTruthy();
    expect(second.button.getAttribute("aria-controls")).not.toBe(firstId);
    first.cleanup();
    second.cleanup();
  });

  it("closes on a second click, Escape and clicks elsewhere", () => {
    const { container, button, cleanup } = mountCard();
    const isOpen = () => !!container.querySelector(".vvp-co__credit-popover");

    click(button);
    click(button);
    expect(isOpen()).toBe(false);

    click(button);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(isOpen()).toBe(false);

    click(button);
    act(() => {
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true }),
      );
    });
    expect(isOpen()).toBe(false);
    cleanup();
  });

  it("opens the source link in a new tab, only for http(s) URLs", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { container, button, cleanup } = mountCard();
    click(button);
    click(container.querySelector(".vvp-co__credit-link")!);
    expect(open).toHaveBeenCalledWith(
      "https://example.org/source",
      "_blank",
      "noopener,noreferrer",
    );
    cleanup();

    const unsafe = mountCard({
      ...props,
      image_credit: { source: "dpa", source_url: "javascript:alert(1)" },
    });
    click(unsafe.button);
    expect(unsafe.container.querySelector(".vvp-co__credit-link")).toBeNull();
    unsafe.cleanup();
  });
});
