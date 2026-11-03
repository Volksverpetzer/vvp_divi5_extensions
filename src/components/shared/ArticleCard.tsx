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
  const cardClass = `vvp-co__feed-card vvp-co__feed-card--article${hero ? " vvp-co__feed-card--hero" : ""}`;
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

  // Every card's byline, under the title: "von … | category | date |
  // reading time", with the Prüfpunkt badge after the authors. Mirrored in
  // CardRenderTrait.php.
  const byline = (
    <div className="vvp-co__feed-byline">
      {author && (
        <span className="vvp-co__feed-byline-author">{`von ${author}`}</span>
      )}
      {source === "pruefpunkt" && <PruefpunktBadge />}
      {category &&
        (category_link ? (
          <span
            role="button"
            tabIndex={0}
            className="vvp-co__category vvp-co__category--btn"
            onClick={handleCategoryClick}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
                handleCategoryClick(e);
              }
            }}
          >
            {category}
          </span>
        ) : (
          <span className="vvp-co__category">{category}</span>
        ))}
      <MetaText className="vvp-co__feed-date">{date}</MetaText>
      {!!reading_time && (
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
      )}
    </div>
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
        {byline}
        {excerpt && <p className="vvp-co__feed-excerpt">{excerpt}</p>}
      </div>
    </a>
  );
};
