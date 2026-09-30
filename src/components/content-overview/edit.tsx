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
import { catPlaceholderImage } from "../shared/catPlaceholder";
import { beardPlaceholderImage } from "../shared/beardPlaceholder";

// ── Example data ─────────────────────────────────────────────────────────────

const img = catPlaceholderImage;
const beardImg = beardPlaceholderImage;

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
    title: "Bartöl-Mythen: Was stimmt wirklich an den Wirkstoffen?",
    excerpt:
      "Der Stoppel-Check zur aktuellen Debatte über Öl- versus Wachspflege. Trotz eindeutiger Datenlage werden die Zahlen regelmäßig falsch interpretiert oder bewusst durchs Kinnhaar gezogen.",
    link: "#",
    date: "15.05.2026",
    reading_time: 3,
    category: "Faktencheck",
    category_link: "#",
    source: "pruefpunkt" as const,
    image_url: beardImg(640, 360),
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
    title: "Wachstumsmythen im Stoppel-Check 2026",
    excerpt:
      "Welche Falschbehauptungen über Bartwuchsmittel kursieren aktuell und was sagen Dermatologinnen dazu? Wir haben die häufigsten Behauptungen geprüft und eingeordnet.",
    link: "#",
    date: "12.05.2026",
    reading_time: 4,
    category: "Gesundheit",
    category_link: "#",
    source: "pruefpunkt" as const,
    image_url: beardImg(641, 360),
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

// ── Reading attrs ────────────────────────────────────────────────────────────
//
// Fields declared with attrName "<name>.innerContent" in module.json store
// their value under attrs.<name>.innerContent.desktop.value, not
// attrs.<name>.desktop.value (same convention every other module's edit.tsx
// uses, e.g. AuthorProfile's showAvatar). Each attr is typed as bare `object`
// in ContentOverviewAttrs, so reading the nested value needs `as any`.

const ALL_CONTENT_TYPES = [
  "articles-volksverpetzer",
  "articles-pruefpunkt",
  "instagram",
  "youtube",
  "podcast",
];

/**
 * Mirrors RenderCallbackTrait::build_overview_html()'s attribute reads, so
 * the Visual Builder preview reflects the same settings the live page uses —
 * without reproducing the server's actual fetch/rank/pin/cap pipeline, which
 * would be overkill for a representative mockup.
 */
const readSettings = (attrs: ContentOverviewEditProps["attrs"]) => {
  const a = attrs as any;

  const rawTypes = a.contentTypes?.innerContent?.desktop?.value;
  const selectedTypes: string[] =
    Array.isArray(rawTypes) && rawTypes.length > 0
      ? rawTypes
      : ALL_CONTENT_TYPES;

  const showVvpArticles = selectedTypes.includes("articles-volksverpetzer");
  const showPpArticles = selectedTypes.includes("articles-pruefpunkt");
  const showInstagram = selectedTypes.includes("instagram");
  const showYoutube = selectedTypes.includes("youtube");
  const showPodcast = selectedTypes.includes("podcast");
  const hasArticles = showVvpArticles || showPpArticles;
  const hasNonArticles = showInstagram || showYoutube || showPodcast;

  const rawItemsToShow = parseInt(
    a.itemsToShow?.innerContent?.desktop?.value ?? "",
    10,
  );
  const itemsToShow =
    Number.isFinite(rawItemsToShow) && rawItemsToShow > 0
      ? Math.max(1, Math.min(rawItemsToShow, 60))
      : 24;

  const showLoadMore = a.showLoadMore?.innerContent?.desktop?.value !== "off";
  const showHeadline = a.showHeadline?.innerContent?.desktop?.value !== "off";
  const headlineText: string =
    a.headline?.innerContent?.desktop?.value || "Das Neueste";

  return {
    showVvpArticles,
    showPpArticles,
    showInstagram,
    showYoutube,
    showPodcast,
    showFilterToggle: hasArticles && hasNonArticles,
    itemsToShow,
    showLoadMore,
    showHeadline,
    headlineText,
  };
};

// ── Main edit component ───────────────────────────────────────────────────────

/**
 * ContentOverview edit component for the Divi Visual Builder.
 * Shows representative example cards, filtered and capped to match the
 * module's own content-type/count/headline settings.
 *
 * @since 1.0.0
 */
export const ContentOverviewEdit = (
  props: ContentOverviewEditProps,
): ReactElement => {
  const { attrs, elements, id, name } = props;
  const settings = readSettings(attrs);

  const articles = MOCK_ARTICLES.filter((article) =>
    article.source === "volksverpetzer"
      ? settings.showVvpArticles
      : settings.showPpArticles,
  );

  const blocks: { key: string; node: ReactElement }[] = [];

  articles.slice(0, 3).forEach((article, i) => {
    blocks.push({
      key: `article-${i}`,
      node: (
        <div className="vvp-co__feed-item">
          <ArticleCard {...article} />
        </div>
      ),
    });
  });

  if (settings.showYoutube) {
    blocks.push({
      key: "youtube-banner",
      node: (
        <div className="vvp-co__feed-item vvp-co__feed-item--youtube-banner">
          <YouTubeBanner {...MOCK_YT} />
        </div>
      ),
    });
  }

  articles.slice(3, 6).forEach((article, i) => {
    blocks.push({
      key: `article-${i + 3}`,
      node: (
        <div className="vvp-co__feed-item">
          <ArticleCard {...article} />
        </div>
      ),
    });
  });

  if (settings.showInstagram) {
    MOCK_IG_ITEMS.forEach((ig, i) => {
      blocks.push({
        key: `ig-${i}`,
        node: (
          <div className="vvp-co__feed-item">
            <InstagramSlideshow {...ig} />
          </div>
        ),
      });
    });
  }

  if (settings.showPodcast) {
    blocks.push({
      key: "podcast-banner",
      node: (
        <div className="vvp-co__feed-item vvp-co__feed-item--podcast">
          <PodcastBanner {...MOCK_PODCAST} />
        </div>
      ),
    });
  }

  const visibleBlocks = blocks.slice(0, settings.itemsToShow);
  const hasMoreBlocks = blocks.length > settings.itemsToShow;

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
        {(settings.showHeadline || settings.showFilterToggle) && (
          <div className="vvp-co__section-header">
            {settings.showHeadline && (
              <h2 className="vvp-co__section-title">{settings.headlineText}</h2>
            )}
            {settings.showFilterToggle && (
              <label
                className="vvp-co__filter-toggle"
                htmlFor="vvp-co-filter-articles-preview"
              >
                <span className="vvp-co__filter-toggle-label">Nur Artikel</span>
                <span className="vvp-co__toggle-track">
                  <input
                    type="checkbox"
                    className="vvp-co__toggle-input"
                    id="vvp-co-filter-articles-preview"
                    disabled
                  />
                  <span className="vvp-co__toggle-thumb"></span>
                </span>
              </label>
            )}
          </div>
        )}

        <div className="vvp-co__feed-grid">
          {visibleBlocks.map((block) => (
            <React.Fragment key={block.key}>{block.node}</React.Fragment>
          ))}
        </div>

        {settings.showLoadMore && hasMoreBlocks && (
          <button type="button" className="vvp-co__load-more-btn" disabled>
            Mehr laden
          </button>
        )}
      </div>
    </ModuleContainer>
  );
};
