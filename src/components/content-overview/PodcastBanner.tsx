import React, { useState } from "react";
import { trackEvent } from "../../utils/plausible";

interface PodcastBannerProps {
  title: string;
  link: string;
  enclosure: string;
  date: string;
  duration: string;
  summary: string;
  artworkUrl: string;
}

const PodcastIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const PodcastBanner: React.FC<PodcastBannerProps> = ({
  title,
  link,
  enclosure,
  date,
  duration,
  summary,
  artworkUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="vvp-co__podcast-banner">
      <div className="vvp-co__podcast-inner">
        {artworkUrl && (
          <div className="vvp-co__podcast-artwork-wrap">
            <img
              src={artworkUrl}
              alt="Podcast"
              className="vvp-co__podcast-artwork"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        <div className="vvp-co__podcast-content">
          <div className="vvp-co__podcast-label">
            <span className="vvp-co__badge vvp-co__badge--podcast">
              <PodcastIcon />
              Podcast
            </span>
          </div>

          <a
            href={link}
            className="vvp-co__podcast-title"
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>

          {summary && <p className="vvp-co__podcast-summary">{summary}</p>}

          {isPlaying && enclosure ? (
            <div className="vvp-co__podcast-player">
              <audio
                controls
                autoPlay
                src={enclosure}
                style={{ width: "100%", marginTop: 8 }}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          ) : null}

          <div className="vvp-co__podcast-footer">
            <span className="vvp-co__podcast-date">{date}</span>

            {duration && (
              <span className="vvp-co__podcast-duration">
                <ClockIcon />
                {duration}
              </span>
            )}

            {enclosure && !isPlaying && (
              <button
                type="button"
                className="vvp-co__podcast-listen-btn"
                onClick={() => { setIsPlaying(true); trackEvent("Podcast Play"); }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Anhören
              </button>
            )}

            {enclosure && isPlaying && (
              <button
                type="button"
                className="vvp-co__podcast-listen-btn vvp-co__podcast-listen-btn--stop"
                onClick={() => setIsPlaying(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Stopp
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
