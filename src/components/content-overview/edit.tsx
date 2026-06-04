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

const CATS = ["neo", "millie", "banana", "bella", "poppy", "louie"] as const;
const img = (seed: string, w = 640, h = 360) => {
  const cat =
    CATS[seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % CATS.length];
  return `https://placecats.com/${cat}/${w}/${h}`;
};

const MOCK_ARTICLES = [
  {
    title: "Warum Fakten mehr zählen als Gefühle",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    link: "#",
    date: "17.05.2026",
    reading_time: 4,
    category: "Analyse",
    category_link: "#",
    source: "volksverpetzer" as const,
    image_url: img("politik1"),
  },
  {
    title: "AfD und die Medien: Eine kritische Bilanz der letzten Monate",
    excerpt:
      "Wie rechte Narrative in den Mainstream gelangen und welche Mechanismen dabei eine Rolle spielen. Ein Überblick über aktuelle Entwicklungen in der deutschen Medienlandschaft.",
    link: "#",
    date: "16.05.2026",
    reading_time: 6,
    category: "Politik",
    category_link: "#",
    source: "volksverpetzer" as const,
    image_url: img("news2"),
  },
  {
    title: "Klimaschutz: Was stimmt wirklich an den Zahlen?",
    excerpt:
      "Der Faktencheck zur aktuellen politischen Debatte über Emissionsziele. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
    link: "#",
    date: "15.05.2026",
    reading_time: 3,
    category: "Faktencheck",
    category_link: "#",
    source: "pruefpunkt" as const,
    image_url: img("nature3"),
  },
  {
    title: "Soziale Medien und politische Polarisierung",
    excerpt:
      "Algorithmen entscheiden, was wir sehen – und das hat Folgen für die Demokratie. Eine Untersuchung der Filterblasen auf Facebook, TikTok und X.",
    link: "#",
    date: "14.05.2026",
    reading_time: 5,
    category: "Medien",
    category_link: "#",
    source: "volksverpetzer" as const,
    image_url: img("tech4"),
  },
  {
    title: "Verschwörungstheorien: So erkennt man sie",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin accumsan nunc at velit feugiat, vitae dignissim est maximus. Duis aute irure dolor in reprehenderit in voluptate.",
    link: "#",
    date: "13.05.2026",
    reading_time: 7,
    category: "Bildung",
    category_link: "#",
    source: "volksverpetzer" as const,
    image_url: img("people5"),
  },
  {
    title: "Impfmythen im Faktencheck 2026",
    excerpt:
      "Welche Falschbehauptungen kursieren aktuell und was sagt die Wissenschaft dazu? Wir haben die häufigsten Aussagen geprüft und eingeordnet.",
    link: "#",
    date: "12.05.2026",
    reading_time: 4,
    category: "Gesundheit",
    category_link: "#",
    source: "pruefpunkt" as const,
    image_url: img("health6"),
  },
];

const MOCK_IG_ITEMS = [
  {
    permalink: "#",
    caption:
      "Wusstet ihr das? Hier sind fünf Fakten, die ihr kennen solltet 👇 #Faktenfuchs #Medienkompetenz",
    date: "Gestern",
    badgeLabel: "Instagram",
    mediaCategory: "Karussell",
    isCarousel: true,
    slides: [
      { thumb: img("ig1a", 600, 800), video: "" },
      { thumb: img("ig1b", 600, 800), video: "" },
      { thumb: img("ig1c", 600, 800), video: "" },
    ],
  },
  {
    permalink: "#",
    caption:
      "So erkennst du Fake News auf einen Blick 🔍 Teile diesen Post mit jemandem, der das wissen sollte!",
    date: "Vor 2 Tagen",
    badgeLabel: "Instagram",
    mediaCategory: "Karussell",
    isCarousel: true,
    slides: [
      { thumb: img("ig2a", 600, 800), video: "" },
      { thumb: img("ig2b", 600, 800), video: "" },
    ],
  },
  {
    permalink: "#",
    caption:
      "Danke für 500.000 Follower! 💙 Gemeinsam gegen Desinformation – das ist möglich.",
    date: "Vor 3 Tagen",
    badgeLabel: "Instagram",
    mediaCategory: "Karussell",
    isCarousel: true,
    slides: [
      { thumb: img("ig3a", 600, 800), video: "" },
      { thumb: img("ig3b", 600, 800), video: "" },
      { thumb: img("ig3c", 600, 800), video: "" },
    ],
  },
];

const MOCK_YT = {
  videoId: "",
  title: "Faktencheck: Die größten Mythen der Woche",
  description:
    "In diesem Video beleuchten wir die meistgeteilten Falschinformationen der letzten Woche und erklären, was wirklich dahintersteckt. Mit konkreten Quellen und verständlichen Erklärungen.",
  date: "Vor 2 Tagen",
  thumbnailUrl: img("youtube1", 1280, 720),
};

const MOCK_PODCAST = {
  title: "Volksverpetzer Podcast – Folge 47: Rechtsextremismus im Netz",
  link: "#",
  enclosure: "",
  date: "03. Mai 2026",
  duration: "52 Min.",
  summary:
    "Wie radikalisieren sich Menschen online, und was können wir dagegen tun? Wir sprechen mit Expert:innen über Prävention, Plattformverantwortung und die Rolle der Zivilgesellschaft.",
  artworkUrl: img("podcast1", 100, 100),
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
          {MOCK_ARTICLES.slice(0, 3).map((a, i) => (
            <div key={i} className="vvp-co__feed-item">
              <ArticleCard {...a} />
            </div>
          ))}

          {/* YouTube banner */}
          <div className="vvp-co__feed-item vvp-co__feed-item--youtube-banner">
            <YouTubeBanner {...MOCK_YT} />
          </div>

          {/* Row 2: articles */}
          {MOCK_ARTICLES.slice(3, 6).map((a, i) => (
            <div key={i + 3} className="vvp-co__feed-item">
              <ArticleCard {...a} />
            </div>
          ))}

          {/* Row 3: Instagram carousels */}
          {MOCK_IG_ITEMS.map((ig, i) => (
            <div key={i} className="vvp-co__feed-item">
              <InstagramSlideshow {...ig} />
            </div>
          ))}

          {/* Podcast banner */}
          <div className="vvp-co__feed-item vvp-co__feed-item--podcast">
            <PodcastBanner {...MOCK_PODCAST} />
          </div>
        </div>
      </div>
    </ModuleContainer>
  );
};
