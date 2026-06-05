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
    title: "Warum Katzenfotos mehr zählen als politische Argumente",
    excerpt:
      "Fell-Checker arbeiten täglich daran, Fehlinformationen über Katzen zu widerlegen, bevor sie sich weiter verbreiten. In sozialen Netzwerken kursieren Falschnachrichten über Fellpflege oft schneller als Korrekturen – dagegen helfen Katzenkompetenz und kritisches Schnurren.",
    link: "#",
    date: "17.05.2026",
    reading_time: 4,
    category: "Analyse",
    category_link: "#",
    source: "volksverpetzer" as const,
    image_url: img("katze1"),
  },
  {
    title: "Schmusekatze oder Schreibtischtäter: Eine kritische Bilanz",
    excerpt:
      "Wie flauschige Narrative in den Mainstream gelangen und welche Mechanismen dabei eine Rolle spielen. Ein Überblick über aktuelle Entwicklungen in der deutschen Katzenlandschaft.",
    link: "#",
    date: "16.05.2026",
    reading_time: 6,
    category: "Politik",
    category_link: "#",
    source: "volksverpetzer" as const,
    image_url: img("katze2"),
  },
  {
    title: "Katzenfutter: Was stimmt wirklich an den Nährwerten?",
    excerpt:
      "Der Fell-Check zur aktuellen Debatte über Trocken- versus Nassfutter. Trotz eindeutiger Datenlage werden die Zahlen regelmäßig falsch interpretiert oder bewusst aus dem Napf gerissen.",
    link: "#",
    date: "15.05.2026",
    reading_time: 3,
    category: "Faktencheck",
    category_link: "#",
    source: "pruefpunkt" as const,
    image_url: img("katze3"),
  },
  {
    title: "Soziale Kratzbäume und politische Polarisierung",
    excerpt:
      "Algorithmen entscheiden, welche Katzenfotos wir sehen – und das hat Folgen für die Demokratie. Eine Untersuchung der Filterblasen auf Fensterbank, TikTok und X.",
    link: "#",
    date: "14.05.2026",
    reading_time: 5,
    category: "Medien",
    category_link: "#",
    source: "volksverpetzer" as const,
    image_url: img("katze4"),
  },
  {
    title: "Verschwörungstheorien: So erkennt man sie am Fell",
    excerpt:
      "Verschwörungstheorien folgen immer ähnlichen Mustern: anonyme Pfoten, angebliche Geheimnisse und das Gefühl, einer kleinen Elite von Dosenöffnern anzugehören. Mit einfachen Regeln lassen sie sich schnell erkennen.",
    link: "#",
    date: "13.05.2026",
    reading_time: 7,
    category: "Bildung",
    category_link: "#",
    source: "volksverpetzer" as const,
    image_url: img("katze5"),
  },
  {
    title: "Impfmythen im Fell-Check 2026",
    excerpt:
      "Welche Falschbehauptungen über Katzenimpfungen kursieren aktuell und was sagen Tierärzte dazu? Wir haben die häufigsten Behauptungen geprüft und eingeordnet.",
    link: "#",
    date: "12.05.2026",
    reading_time: 4,
    category: "Gesundheit",
    category_link: "#",
    source: "pruefpunkt" as const,
    image_url: img("katze6"),
  },
];

const MOCK_IG_ITEMS = [
  {
    permalink: "#",
    caption:
      "Wusstet ihr das? Hier sind fünf Fakten über Katzen, die ihr kennen solltet 🐾 #Pfotenfuchs #Katzenkompetenz",
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
      "So erkennst du Fake News über Katzen auf einen Blick 🔍 Teile diesen Post mit jemandem, der das wissen sollte!",
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
      "Danke für 500.000 Follower! 🐱 Gemeinsam gegen Katzen-Desinformation – das ist möglich.",
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
  title: "Fell-Check: Die größten Katzen-Mythen der Woche",
  description:
    "In diesem Video beleuchten wir die meistgeteilten Falschinformationen über Katzen der letzten Woche und erklären, was wirklich dahintersteckt. Mit konkreten Quellen und verständlichen Schnurr-Erklärungen.",
  date: "Vor 2 Tagen",
  thumbnailUrl: img("katze-yt", 1280, 720),
};

const MOCK_PODCAST = {
  title:
    "Katzenverpetzer Podcast – Folge 47: Rechtsextremismus im Katzeninternet",
  link: "#",
  enclosure: "",
  date: "03. Mai 2026",
  duration: "52 Min.",
  summary:
    "Wie radikalisieren sich Katzen online, und was können Dosenöffner dagegen tun? Wir sprechen mit Expert:innen über Prävention, Kratzbaum-Verantwortung und die Rolle der Zivilgesellschaft.",
  artworkUrl: img("katze-pod", 100, 100),
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
