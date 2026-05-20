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

// ── Example data ─────────────────────────────────────────────────────────────

const MOCK_ARTICLE = {
  title: "Warum Fakten mehr zählen als Gefühle",
  excerpt:
    "Eine Analyse der häufigsten Desinformationsmuster in sozialen Netzwerken.",
  link: "#",
  date: "17.05.2026",
  reading_time: 4,
  category: "Analyse",
  category_link: "#",
  source: "volksverpetzer" as const,
  image_url:
    "https://via.placeholder.com/640x360/e5e7eb/a3a3a3?text=Beispiel-Bild",
};

const MOCK_ARTICLE_2 = {
  title: "AfD und die Medien: Eine Bilanz",
  excerpt: "Wie rechte Narrative in den Mainstream gelangen.",
  link: "#",
  date: "16.05.2026",
  reading_time: 6,
  category: "Politik",
  category_link: "#",
  source: "volksverpetzer" as const,
  image_url:
    "https://via.placeholder.com/640x360/e5e7eb/a3a3a3?text=Artikel+2",
};

const MOCK_PRUEFPUNKT = {
  title: "Klimaschutz: Was stimmt wirklich?",
  excerpt:
    "Der Faktencheck zur aktuellen politischen Debatte über Emissionsziele.",
  link: "#",
  date: "15.05.2026",
  reading_time: 3,
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

      <div className="vvp-co__wrapper">
        <div className="vvp-co__section-header">
          <h2 className="vvp-co__section-title">Das Neueste</h2>
        </div>

        <div className="vvp-co__feed-grid">
          {/* Row 1: articles */}
          <div className="vvp-co__feed-item">
            <ArticleCard {...MOCK_ARTICLE} />
          </div>
          <div className="vvp-co__feed-item">
            <ArticleCard {...MOCK_ARTICLE_2} />
          </div>
          <div className="vvp-co__feed-item">
            <ArticleCard {...MOCK_PRUEFPUNKT} />
          </div>

          {/* Row 2: Instagram carousels */}
          <div className="vvp-co__feed-item">
            <InstagramSlideshow {...MOCK_IG} />
          </div>
          <div className="vvp-co__feed-item">
            <InstagramSlideshow {...MOCK_IG} />
          </div>
          <div className="vvp-co__feed-item">
            <InstagramSlideshow {...MOCK_IG} />
          </div>

          {/* YouTube banner */}
          <div className="vvp-co__feed-item vvp-co__feed-item--youtube-banner">
            <YouTubeBanner {...MOCK_YT} />
          </div>

          {/* Podcast banner */}
          <div className="vvp-co__feed-item vvp-co__feed-item--podcast">
            <PodcastBanner {...MOCK_PODCAST} />
          </div>
        </div>
      </div>
    </ModuleContainer>
  );
};
