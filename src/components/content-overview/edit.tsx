// External Dependencies.
import React, { ReactElement } from "react";

// Divi Dependencies.
import { ModuleContainer } from "@divi/module";

// Local Dependencies.
import { ContentOverviewEditProps } from "./types";
import { ModuleStyles } from "./styles";
import { moduleClassnames } from "./module-classnames";
import { ModuleScriptData } from "./module-script-data";

// Real components
import { ArticleCard } from "./ArticleCard";
import { InstagramSlideshow } from "./InstagramSlideshow";
import { PodcastBanner } from "./PodcastBanner";
import { YouTubeBanner } from "./YouTubeBanner";

// ── Tiny icon set ────────────────────────────────────────────────────────────

const IconNewspaper = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
  </svg>
);

// ── Example data ─────────────────────────────────────────────────────────────

const MOCK_ARTICLE = {
  title: "Warum Fakten mehr zählen als Gefühle",
  excerpt:
    "Eine Analyse der häufigsten Desinformationsmuster in sozialen Netzwerken.",
  link: "#",
  date: "17. April 2026",
  category: "Analyse",
  category_link: "#",
  source: "volksverpetzer" as const,
  image_url:
    "https://via.placeholder.com/640x360/e5e7eb/a3a3a3?text=Beispiel-Bild",
};

const MOCK_PRUEFPUNKT = {
  title: "Klimaschutz: Was stimmt wirklich?",
  excerpt:
    "Der Faktencheck zur aktuellen politischen Debatte über Emissionsziele.",
  link: "#",
  date: "15. April 2026",
  category: "Faktencheck",
  source: "pruefpunkt" as const,
  image_url:
    "https://via.placeholder.com/640x360/e5e7eb/a3a3a3?text=Faktencheck",
};

const MOCK_IG = {
  permalink: "#",
  caption: "Beispiel-Caption für einen Instagram-Beitrag …",
  date: "Gestern",
  badgeLabel: "Instagram",
  mediaCategory: "Karussell",
  isCarousel: true,
  slides: [
    {
      thumb: "https://via.placeholder.com/600x800/1a1a2e/ffffff?text=Slide+1",
      video: "",
    },
    {
      thumb: "https://via.placeholder.com/600x800/2a2a3e/ffffff?text=Slide+2",
      video: "",
    },
    {
      thumb: "https://via.placeholder.com/600x800/3a3a4e/ffffff?text=Slide+3",
      video: "",
    },
  ],
};

const MOCK_YT = {
  videoId: "",
  title: "Beispiel-Video: Faktencheck aktuell",
  description:
    "In diesem Video beleuchten wir aktuelle Falschinformationen und zeigen, wie man sie erkennt.",
  date: "Vor 2 Tagen",
  thumbnailUrl:
    "https://via.placeholder.com/640x360/1a1a2e/ffffff?text=YouTube+Vorschau",
};

const MOCK_PODCAST = {
  title: "Volksverpetzer Podcast – Folge 42",
  link: "#",
  enclosure: "",
  date: "12. April 2026",
  duration: "45 Min.",
  summary:
    "In dieser Folge sprechen wir über Desinformation und Medienkompetenz …",
  artworkUrl: "https://via.placeholder.com/100x100/2d4a6e/ffffff?text=Podcast",
};

// ── Main edit component ───────────────────────────────────────────────────────

/**
 * ContentOverview edit component for the Divi Visual Builder.
 * Shows representative example cards so the editor can see the real layout.
 *
 * @since 1.0.0
 */
export const ContentOverviewEdit = (
  props: ContentOverviewEditProps,
): ReactElement => {
  const { attrs, elements, id, name } = props;

  return (
    <ModuleContainer
      attrs={attrs}
      elements={elements}
      id={id}
      name={name}
      stylesComponent={ModuleStyles}
      classnamesFunction={moduleClassnames}
      scriptDataComponent={ModuleScriptData}
    >
      {elements.styleComponents({ attrName: "module" })}

      <div className="vvp-co__wrapper vvp-co__wrapper--preview">
        {/* Module header hint */}
        <div className="vvp-co__preview-header">
          <IconNewspaper size={16} />
          <span className="vvp-co__preview-label">
            Inhaltsübersicht — Live-Daten werden serverseitig geladen
          </span>
        </div>

        {/* Top grid skeleton (hero + sidebar) */}
        <div className="vvp-co__top-grid">
          <div className="vvp-co__hero-wrap">
            <div className="vvp-co__skeleton vvp-co__skeleton--hero">
              <div className="vvp-co__skeleton-img" />
              <div className="vvp-co__skeleton-body">
                <div className="vvp-co__skeleton-badge" />
                <div className="vvp-co__skeleton-line vvp-co__skeleton-line--title" />
                <div className="vvp-co__skeleton-line" />
                <div className="vvp-co__skeleton-line vvp-co__skeleton-line--short" />
              </div>
            </div>
          </div>

          <div className="vvp-co__sidebar">
            <div className="vvp-co__sidebar-header">
              <IconNewspaper size={14} />
              <span className="vvp-co__sidebar-title">Neueste Artikel</span>
            </div>
            <div className="vvp-co__sidebar-cards">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="vvp-co__skeleton vvp-co__skeleton--compact"
                >
                  <div className="vvp-co__skeleton-thumb" />
                  <div className="vvp-co__skeleton-body">
                    <div className="vvp-co__skeleton-line" />
                    <div className="vvp-co__skeleton-line vvp-co__skeleton-line--short" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feed section — representative real-looking example cards */}
        <div className="vvp-co__feed-section">
          <div className="vvp-co__feed-header">
            <span className="vvp-co__feed-heading">Weitere Beiträge</span>
            <div className="vvp-co__feed-divider" />
          </div>
          <div className="vvp-co__feed-grid">
            {/* Row 1: three article cards */}
            <div className="vvp-co__feed-item">
              <ArticleCard {...MOCK_ARTICLE} />
            </div>
            <div className="vvp-co__feed-item">
              <InstagramSlideshow {...MOCK_IG} />
            </div>
            <div className="vvp-co__feed-item">
              <ArticleCard {...MOCK_PRUEFPUNKT} />
            </div>

            {/* Row 2: YouTube banner (full width) */}
            <div className="vvp-co__feed-item vvp-co__feed-item--youtube-banner">
              <YouTubeBanner {...MOCK_YT} />
            </div>

            {/* Row 3: podcast banner (full width) */}
            <div className="vvp-co__feed-item vvp-co__feed-item--podcast">
              <PodcastBanner {...MOCK_PODCAST} />
            </div>

            {/* Row 3: more article skeletons */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="vvp-co__feed-item">
                <div className="vvp-co__skeleton vvp-co__skeleton--feed">
                  <div className="vvp-co__skeleton-img" />
                  <div className="vvp-co__skeleton-body">
                    <div className="vvp-co__skeleton-badge" />
                    <div className="vvp-co__skeleton-line vvp-co__skeleton-line--title" />
                    <div className="vvp-co__skeleton-line" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModuleContainer>
  );
};
