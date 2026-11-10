import React, { useEffect, useState } from "react";
import { Badge, MetaText } from "@volksverpetzer/ui-web";
import { trackEvent } from "../../utils/plausible";
import { PodcastPlayer } from "./PodcastPlayer";

// This PR started rendering one PodcastBanner per episode instead of a
// single one per page, so without cross-instance coordination two "Anhören"
// clicks would play two episodes' audio at once. Broadcasting a play event
// lets every other mounted instance stop itself, independent of how many
// are on the page.
const PLAY_EVENT = "vvp-co-podcast-play";

// The player slides open/closed with a CSS animation (style.css). The
// phase normally advances on animationend; this timeout is the fallback
// for when that never fires -- prefers-reduced-motion (animation: none),
// a background tab, or a test environment without CSS. Slightly longer
// than the 250ms animation so it never cuts one short.
const PLAYER_ANIMATION_FALLBACK_MS = 400;

type PlayerPhase = "closed" | "opening" | "open" | "closing";

interface PodcastBannerProps {
  title: string;
  link: string;
  enclosure: string;
  date: string;
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

export const PodcastBanner: React.FC<PodcastBannerProps> = ({
  title,
  link,
  enclosure,
  date,
  summary,
  artworkUrl,
}) => {
  const [phase, setPhase] = useState<PlayerPhase>("closed");
  // Bumped on every "Anhören" so re-opening while the close animation is
  // still running mounts a fresh player (and autoplays) instead of
  // reusing the one that was just paused.
  const [playKey, setPlayKey] = useState(0);
  const isPlaying = phase === "opening" || phase === "open";
  const closePlayer = () => setPhase((p) => (p === "closed" ? p : "closing"));
  // A plain module-scoped React useId() collides across instances here:
  // each PodcastBanner hydrates through its own separate hydrateRoot()
  // call (frontend.tsx), and React's id generator is scoped per root, so
  // two independent roots can generate the same id without an explicit
  // identifierPrefix. A Symbol is unique by construction regardless of
  // how many roots exist, and never needs to leave this JS realm (it's
  // only compared in-memory via the CustomEvent, never serialized).
  const [instanceId] = useState(() => Symbol("podcast-banner"));

  useEffect(() => {
    const handlePlay = (event: Event) => {
      const otherId = (event as CustomEvent<symbol>).detail;
      if (otherId !== instanceId) {
        closePlayer();
      }
    };
    window.addEventListener(PLAY_EVENT, handlePlay);
    return () => window.removeEventListener(PLAY_EVENT, handlePlay);
  }, [instanceId]);

  const advancePhase = () =>
    setPhase((p) =>
      p === "opening" ? "open" : p === "closing" ? "closed" : p,
    );

  useEffect(() => {
    if (phase !== "opening" && phase !== "closing") return;
    const timer = setTimeout(advancePhase, PLAYER_ANIMATION_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const startPlaying = () => {
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: instanceId }));
    setPlayKey((k) => k + 1);
    setPhase("opening");
    trackEvent("Podcast Play");
  };

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
            <Badge variant="pruefpunkt" size="md" icon={<PodcastIcon />}>
              Podcast
            </Badge>
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

          {phase !== "closed" && enclosure ? (
            <div
              key={playKey}
              className={`vvp-co__podcast-player-wrap vvp-co__podcast-player-wrap--${phase}`}
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget) advancePhase();
              }}
            >
              <div className="vvp-co__podcast-player-clip">
                <PodcastPlayer
                  src={enclosure}
                  stopped={phase === "closing"}
                  onEnded={closePlayer}
                />
              </div>
            </div>
          ) : null}

          <div className="vvp-co__podcast-footer">
            <MetaText className="vvp-co__podcast-date">{date}</MetaText>

            {enclosure && !isPlaying && (
              <button
                type="button"
                className="vvp-co__podcast-listen-btn"
                onClick={startPlaying}
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
                onClick={closePlayer}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                Schließen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
