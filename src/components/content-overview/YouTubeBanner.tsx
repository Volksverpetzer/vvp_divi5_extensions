import React from "react";

export interface YouTubeBannerProps {
  videoId: string;
  title: string;
  description: string;
  date: string;
  thumbnailUrl: string;
}

const YoutubeIcon = () => (
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
);

export const YouTubeBanner: React.FC<YouTubeBannerProps> = ({
  videoId,
  title,
  description,
  date,
  thumbnailUrl,
}) => {
  const ytUrl = videoId ? `https://youtube.com/watch?v=${videoId}` : "#";

  return (
    <div className="vvp-co__yt-banner">
      <div className="vvp-co__yt-banner-inner">
        <a
          href={ytUrl}
          className="vvp-co__yt-banner-thumb-wrap"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={title}
        >
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="vvp-co__yt-banner-thumb"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="vvp-co__yt-banner-play" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </a>

        <div className="vvp-co__yt-banner-content">
          <div className="vvp-co__yt-banner-label">
            <span className="vvp-co__badge vvp-co__badge--youtube">
              <YoutubeIcon />
              YouTube
            </span>
          </div>

          <a
            href={ytUrl}
            className="vvp-co__yt-banner-title"
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>

          {description && (
            <p className="vvp-co__yt-banner-description">{description}</p>
          )}

          <div className="vvp-co__yt-banner-footer">
            <span className="vvp-co__yt-banner-date">{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
