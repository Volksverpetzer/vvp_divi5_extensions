import * as React from "react";
import { trackEvent } from "../../utils/plausible";

export interface ArticleCardProps {
  type?: "article" | "youtube";
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
  trackingContext?: "feed" | "trending";
}

const SourceBadge: React.FC<{ source: "volksverpetzer" | "pruefpunkt" }> = ({
  source,
}) => {
  if (source === "pruefpunkt") {
    return (
      <span className="vvp-co__badge vvp-co__badge--pruefpunkt">Prüfpunkt</span>
    );
  }
  return <span className="vvp-co__badge vvp-co__badge--vvp">VVP</span>;
};

const YoutubeBadge: React.FC = () => (
  <span className="vvp-co__badge vvp-co__badge--youtube">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="10"
      viewBox="0 0 461 461"
      fill="currentColor"
      aria-hidden="true"
      style={{ marginRight: "4px" }}
    >
      <path d="M365.257 67.393H95.744C42.866 67.393 0 110.259 0 163.137v134.728c0 52.878 42.866 95.744 95.744 95.744h269.513c52.878 0 95.744-42.866 95.744-95.744V163.137c0-52.878-42.866-95.744-95.744-95.744zm-64.751 169.663l-126.06 60.123c-3.359 1.602-7.239-.847-7.239-4.568V168.607c0-3.774 3.982-6.22 7.348-4.514l126.06 63.943c3.748 1.899 3.683 7.274-.109 9.02z" />
    </svg>
    YouTube
  </span>
);

export const ArticleCard: React.FC<ArticleCardProps> = ({
  type = "article",
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
}) => {
  const isYoutube = type === "youtube";
  const cardClass = isYoutube
    ? "vvp-co__feed-card vvp-co__feed-card--youtube"
    : "vvp-co__feed-card vvp-co__feed-card--article";

  const handleCategoryClick = (e: React.SyntheticEvent) => {
    if (category_link) {
      e.preventDefault();
      e.stopPropagation();
      window.open(category_link, "_blank", "noopener,noreferrer");
    }
  };

  const handleClick = () => {
    if (trackingContext === "trending") {
      trackEvent("Trending Click");
    } else {
      trackEvent("Feed Click");
      if (source === "pruefpunkt") trackEvent("Pruefpunkt Click");
    }
  };

  return (
    <a
      href={link}
      className={cardClass}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      {image_url && (
        <div
          className={`vvp-co__feed-image-wrap ${isYoutube ? "vvp-co__feed-image-wrap--yt" : ""}`}
        >
          <img
            src={image_url}
            alt={title}
            className="vvp-co__feed-image"
            loading="lazy"
            decoding="async"
          />
          {isYoutube && (
            <div className="vvp-co__yt-play-btn" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
      )}
      <div className="vvp-co__feed-body">
        <h3 className="vvp-co__feed-title">{title}</h3>
        {excerpt && (
          <p className="vvp-co__feed-excerpt">
            {excerpt}
            {author && <em className="vvp-co__feed-author"> – {author}</em>}
          </p>
        )}
        <div className="vvp-co__feed-footer">
          {isYoutube ? <YoutubeBadge /> : <SourceBadge source={source} />}
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
          <span className="vvp-co__feed-date">{date}</span>
          {!!reading_time && (
            <span className="vvp-co__feed-reading-time">
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
              {reading_time} Min.
            </span>
          )}
        </div>
      </div>
    </a>
  );
};
