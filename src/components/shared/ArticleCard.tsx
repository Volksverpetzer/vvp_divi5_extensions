import * as React from "react";
import { Badge, MetaText } from "@volksverpetzer/ui-web";
import { trackEvent } from "../../utils/plausible";
import { isExternalUrl, toHttpUrl } from "../../utils/links";
import "./ArticleCard.css";

export interface ArticleCardProps {
  title: string;
  excerpt?: string;
  author?: string;
  reading_time?: number;
  link: string;
  date: string;
  image_url?: string;
  category?: string;
  category_link?: string;
  source?: "volksverpetzer" | "pruefpunkt";
  trackingContext?: "feed" | "trending" | "related";
  /**
   * Open the card (and its category link) in a new tab. Derived from `link`
   * when omitted; PHP passes it explicitly for hydrated cards so server and
   * client markup can't disagree.
   */
  external?: boolean;
  /**
   * Lead-story layout (e.g. the front-page hero): larger title as an <h2>
   * and an eagerly loaded, high-priority image, since it's typically the
   * page's LCP element. Mirrored in CardRenderTrait.php for hydration.
   */
  hero?: boolean;
  /**
   * Inner HTML of the image wrapper, taken verbatim from the server-rendered
   * card at hydration time (content-overview frontend.tsx). Plugins such as
   * Image Source Control rewrite the page's <img> tags after our PHP renders
   * them (e.g. wrapping them with the image credit); rendering this markup
   * as-is keeps those additions and the hydration match. Client-only — never
   * part of the PHP props.
   */
  imageHtml?: string;
}

/**
 * Prepares the server-rendered image wrapper for `imageHtml`. Image Source
 * Control can link the image credit (`.isc-source-text a`), a link nested in
 * the card's link. The server removes those links
 * (includes/class-vvp-isc-card-credit-links.php); this covers markup that got
 * past it. There the parser has already split the card: it closed the card
 * link at the credit, re-opened it inside the image wrapper and moved the
 * credit link out of `.isc-source-text`. Undo that, so the wrapper holds just
 * the image and its credit, without links.
 */
export const unwrapImageLinks = (wrap: Element) => {
  wrap.querySelectorAll("a").forEach((a) => a.replaceWith(...a.childNodes));
  const source = wrap.querySelector(":scope > .isc-source");
  const text = source?.querySelector(".isc-source-text");
  while (source && text && source.nextSibling) text.append(source.nextSibling);
};

const PruefpunktBadge: React.FC = () => (
  <Badge variant="pruefpunkt" size="md">
    Prüfpunkt
  </Badge>
);

export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  excerpt,
  author,
  reading_time,
  link,
  date,
  image_url,
  category,
  category_link,
  source = "volksverpetzer",
  trackingContext = "feed",
  external,
  hero = false,
  imageHtml,
}) => {
  const opensNewTab = external ?? isExternalUrl(link);
  // `show-source`: the site's Image Source Control CSS hides image credits
  // unless an ancestor has this class (set per module in Divi elsewhere);
  // the lead story always shows its credit, like the Divi Blog hero did.
  // Mirrored in CardRenderTrait.php.
  const cardClass = `vvp-co__feed-card vvp-co__feed-card--article${hero ? " vvp-co__feed-card--hero show-source" : ""}`;
  const TitleTag = hero ? "h2" : "h3";

  const handleCategoryClick = (e: React.SyntheticEvent) => {
    if (!category_link) return;
    e.preventDefault();
    e.stopPropagation();
    // Only ever navigate to http(s): category_link can come from remote
    // REST data, and location.assign("javascript:…") would run in this page.
    const target = toHttpUrl(category_link);
    if (!target) return;
    if (isExternalUrl(target.href)) {
      window.open(target.href, "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(target.href);
    }
  };

  const handleClick = () => {
    if (trackingContext === "trending") {
      trackEvent("Trending Click");
    } else if (trackingContext === "related") {
      trackEvent("Related Click");
    } else {
      trackEvent("Feed Click");
      if (source === "pruefpunkt") trackEvent("Pruefpunkt Click");
    }
  };

  // Under the title: the authors ("von …"). The rest of the meta data sits
  // in the footer at the bottom of the card, laid out like the Instagram and
  // YouTube cards' footers: a badge on the left (the category, linking to
  // its archive; on Prüfpunkt articles just the Prüfpunkt badge instead),
  // date and reading time on the right,
  // separated by a "|". Same on the hero. Mirrored in CardRenderTrait.php.
  const authorItem = author && (
    <span className="vvp-co__feed-byline-author">{`von ${author}`}</span>
  );
  const isPruefpunkt = source === "pruefpunkt";
  const metaItems = (
    <>
      {isPruefpunkt && <PruefpunktBadge />}
      {!isPruefpunkt &&
        category &&
        (category_link ? (
          <Badge
            variant="primary"
            size="md"
            className="vvp-co__category vvp-co__category--btn"
            role="button"
            tabIndex={0}
            onClick={handleCategoryClick}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
                handleCategoryClick(e);
              }
            }}
          >
            {category}
          </Badge>
        ) : (
          <Badge variant="primary" size="md" className="vvp-co__category">
            {category}
          </Badge>
        ))}
      <span className="vvp-co__feed-footer-meta">
        <MetaText className="vvp-co__feed-date">{date}</MetaText>
        {!!reading_time && (
          <>
            <span className="vvp-co__feed-footer-sep" aria-hidden="true">
              |
            </span>
            <MetaText className="vvp-co__feed-reading-time">
              <svg
                aria-hidden="true"
                focusable="false"
                data-icon="clock"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {`${reading_time} Min.`}
            </MetaText>
          </>
        )}
      </span>
    </>
  );

  return (
    <a
      href={link}
      className={cardClass}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      onClick={handleClick}
    >
      {image_url &&
        (imageHtml !== undefined ? (
          <div
            className="vvp-co__feed-image-wrap"
            dangerouslySetInnerHTML={{ __html: imageHtml }}
          />
        ) : (
          <div className="vvp-co__feed-image-wrap">
            <img
              src={image_url}
              alt={title}
              className="vvp-co__feed-image"
              loading={hero ? "eager" : "lazy"}
              fetchPriority={hero ? "high" : undefined}
              decoding="async"
            />
          </div>
        ))}
      <div className="vvp-co__feed-body">
        <TitleTag className="vvp-co__feed-title">{title}</TitleTag>
        {authorItem && <div className="vvp-co__feed-byline">{authorItem}</div>}
        {excerpt && <p className="vvp-co__feed-excerpt">{excerpt}</p>}
        <div className="vvp-co__feed-footer">{metaItems}</div>
      </div>
    </a>
  );
};
