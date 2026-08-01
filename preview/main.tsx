import React from "react";
import { createRoot } from "react-dom/client";
import "../src/components/fact-check-search/style.scss";
import "../src/components/content-overview/style.scss";
import "../src/components/author-profile/style.scss";
import "../src/components/trending-items/style.scss";
import "../src/components/trending-list/style.scss";
import "../src/components/related-items/style.scss";
import "../src/components/campaign-progress/style.scss";
import "../src/components/campaign-donate/style.scss";
import { FactCheckSearchApp } from "../src/components/fact-check-search/App";
import { CampaignProgressApp } from "../src/components/campaign-progress/App";
import { CampaignDonateApp } from "../src/components/campaign-donate/App";
import {
  ArticleCard,
  type ArticleCardProps,
} from "../src/components/shared/ArticleCard";
import { InstagramSlideshow } from "../src/components/content-overview/InstagramSlideshow";
import { PodcastBanner } from "../src/components/content-overview/PodcastBanner";
import { YouTubeBanner } from "../src/components/content-overview/YouTubeBanner";
import { AuthorProfileApp } from "../src/components/author-profile/App";
import { TrendingItemsApp } from "../src/components/trending-items/App";
import { TrendingListApp } from "../src/components/trending-list/App";
import { RelatedItemsApp } from "../src/components/related-items/App";
import { catPlaceholderImage as pimg } from "../src/components/shared/catPlaceholder";

// ── Sample data ───────────────────────────────────────────────────────────────

const TRENDING_ALL: ArticleCardProps[] = [
  {
    title:
      "Nein, diese Katze hat das Sofa NICHT selbst zerkratzt – der Fell-Check",
    link: "/fell-check/sofa-zerkratzt/",
    image_url: pimg("tr1", 320, 240),
    date: "1. Mai 2026",
    category: "Fell-Check",
  },
  {
    title: "5 Mythen über Katzentrockenfutter – und was Tierärzte dazu sagen",
    link: "/fell-check/mythen-trockenfutter/",
    image_url: pimg("tr2", 320, 240),
    date: "28. April 2026",
    category: "Fell-Check",
  },
  {
    title:
      "Warum dieser virale Post über schlafende Katzen komplett übertrieben ist",
    link: "/desinformation/viral-post-schlafkatzen/",
    image_url: pimg("tr3", 320, 240),
    date: "25. April 2026",
    category: "Desinformation",
  },
  {
    title:
      "Katzenklo-Entsorgung: Was die Zahlen wirklich sagen – und was nicht",
    link: "/analyse/katzenklo-zahlen/",
    image_url: pimg("tr4", 320, 240),
    date: "20. April 2026",
    category: "Analyse",
  },
  {
    title: "So funktioniert Manipulation im Katzenheim-Vorstand",
    link: "/desinformation/katzenheim-vorstand/",
    image_url: pimg("tr5", 320, 240),
    date: "15. April 2026",
    category: "Medien",
  },
];

const TRENDING_PODCAST: ArticleCardProps[] = [
  {
    title:
      "Podcast – Folge 47: Wie Katzen das Internet und unsere Meinung formen",
    link: "/podcast/katzen-internet/",
    image_url: pimg("trpod", 320, 320),
    date: "3. Mai 2026",
  },
];

const TRENDING_EMPTY: ArticleCardProps[] = [];

const TRENDING_LIST_ITEMS = [
  {
    title:
      "Bärbel Bas hat RECHT: Aber Tagesthemen stimmen NIUS, BILD & AfD zu!?",
    link: "#",
    date: "8. Mai 2026",
    author: "Thomas Laschyk",
  },
  {
    title: "75 % wollen KEINEN AfD-Kanzler: Wie die WELT für die AfD lügt",
    link: "#",
    date: "7. Mai 2026",
    author: "Thomas Laschyk",
  },
  {
    title:
      "Faktencheck: Warum diese Behauptung über Katzen komplett falsch ist",
    link: "#",
    date: "6. Mai 2026",
    author: "Bella Kratzenbach",
  },
];

const AUTHOR_SINGLE = [
  {
    name: "Whisker Pfotenhauer",
    bio: "Chefredakteur und leitender Schnurrhaar-Analyst bei Volksverpetzer.<br />\nSchreibt über Mäuse, Desinformation und das Phänomen des Karton-Sitzens.<br />\nSeit 2017 bei Volksverpetzer, vorher hauptberuflich Sofa-Bewacher.",
    avatarUrl: pimg("avatar-whisker", 150, 150),
    profileUrl: "#",
  },
];

const AUTHOR_MULTI = [
  {
    name: "Bella Kratzenbach",
    bio: "Gründerin und Chefredakteurin. Schwerpunkt: politische Fehlinformation und nächtliche Mäusejagd.",
    avatarUrl: pimg("avatar-bella", 150, 150),
    profileUrl: "#",
  },
  {
    name: "Louie Flauschmann",
    bio: "Redakteur und Faktenprüfer. Spezialisiert auf Knäuel-Analyse, Fensterbank-Recherche und Social-Media-Manipulation.",
    avatarUrl: pimg("avatar-louie", 150, 150),
    profileUrl: "#",
  },
];

const IG_PROPS = {
  permalink: "https://www.instagram.com/volksverpetzer/",
  caption:
    "❌ FALSCH: Diese Behauptung über Katzenfutter kursiert gerade massenhaft – wir haben sie gecheckt. Hier sind die Fakten 🐾 Speichern & teilen, damit dein Umfeld es auch weiß! #Pfotenfuchs #Katzenfakten #Fellcheck",
  date: "9. Mai 2026",
  badgeLabel: "Instagram · 4 Bilder",
  slides: [
    { thumb: pimg("ig1", 400, 533), video: "" },
    { thumb: pimg("ig2", 400, 533), video: "" },
    { thumb: pimg("ig3", 400, 533), video: "" },
    { thumb: pimg("ig4", 400, 533), video: "" },
  ],
  isCarousel: true,
};

const PODCAST_PROPS = {
  title:
    "Katzenverpetzer Podcast – Folge 47: Rechtsextremismus im Katzeninternet",
  link: "https://volksverpetzer.de/podcast/",
  enclosure: "https://cdn.podigee.com/media/podcast_episode_example.mp3",
  date: "3. Mai 2026",
  duration: "52:14",
  summary:
    "Wie radikalisieren sich Katzen online, und was können Dosenöffner dagegen tun? Wir sprechen mit Expert:innen über Prävention, Kratzbaum-Verantwortung und die Rolle der Zivilgesellschaft.",
  artworkUrl: pimg("podcast", 120, 120),
};

// ── ContentOverview feed mock data ───────────────────────────────────────────

const FEED_ARTICLES: ArticleCardProps[] = [
  {
    title: "Warum Katzenfotos mehr zählen als politische Argumente",
    excerpt:
      "Fell-Checker arbeiten täglich daran, Fehlinformationen über Katzen zu widerlegen, bevor sie sich weiter verbreiten. In sozialen Netzwerken kursieren Falschnachrichten über Fellpflege oft schneller als Korrekturen – dagegen helfen Katzenkompetenz und kritisches Schnurren.",
    link: "#",
    date: "17.05.2026",
    reading_time: 4,
    category: "Analyse",
    category_link: "#",
    source: "volksverpetzer",
    image_url: pimg("katze1"),
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
    source: "volksverpetzer",
    image_url: pimg("katze2"),
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
    source: "pruefpunkt",
    image_url: pimg("katze3"),
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
    source: "volksverpetzer",
    image_url: pimg("katze4"),
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
    source: "volksverpetzer",
    image_url: pimg("katze5"),
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
    source: "pruefpunkt",
    image_url: pimg("katze6"),
  },
];

const FEED_IG = [
  {
    permalink: "#",
    caption:
      "Wusstet ihr das? Hier sind fünf Fakten über Katzen, die ihr kennen solltet 🐾 #Pfotenfuchs #Katzenkompetenz",
    date: "Gestern",
    badgeLabel: "Instagram",
    mediaCategory: "Karussell",
    isCarousel: true,
    slides: [
      { thumb: pimg("ig1a", 600, 800), video: "" },
      { thumb: pimg("ig1b", 600, 800), video: "" },
      { thumb: pimg("ig1c", 600, 800), video: "" },
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
      { thumb: pimg("ig2a", 600, 800), video: "" },
      { thumb: pimg("ig2b", 600, 800), video: "" },
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
      { thumb: pimg("ig3a", 600, 800), video: "" },
      { thumb: pimg("ig3b", 600, 800), video: "" },
      { thumb: pimg("ig3c", 600, 800), video: "" },
    ],
  },
];

const FEED_YT = {
  videoId: "",
  title: "Fell-Check: Die größten Katzen-Mythen der Woche",
  description:
    "In diesem Video beleuchten wir die meistgeteilten Falschinformationen über Katzen der letzten Woche und erklären, was wirklich dahintersteckt. Mit konkreten Quellen und verständlichen Schnurr-Erklärungen.",
  date: "Vor 2 Tagen",
  thumbnailUrl: pimg("katze-yt", 1280, 720),
};

const FEED_PODCAST = {
  title:
    "Katzenverpetzer Podcast – Folge 47: Rechtsextremismus im Katzeninternet",
  link: "#",
  enclosure: "",
  date: "03. Mai 2026",
  duration: "52 Min.",
  summary:
    "Wie radikalisieren sich Katzen online, und was können Dosenöffner dagegen tun? Wir sprechen mit Expert:innen über Prävention, Kratzbaum-Verantwortung und die Rolle der Zivilgesellschaft.",
  artworkUrl: pimg("katze-pod", 100, 100),
};

// ── Preview shell ─────────────────────────────────────────────────────────────

const toId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[·\s/,()]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [component, ...rest] = title.split(" · ");
  const variant = rest.join(" · ");
  return (
    <section
      id={toId(title)}
      style={{
        marginBottom: "3rem",
        paddingTop: "3rem",
        borderTop: "2px dashed #e5e7eb",
        scrollMarginTop: "1rem",
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#111827",
          marginBottom: "1.5rem",
          lineHeight: 1.25,
        }}
      >
        {component}
        {variant && (
          <span
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: "#6b7280",
              marginLeft: "0.5rem",
            }}
          >
            · {variant}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
};

const TOC_GROUPS: { component: string; sections: string[] }[] = [
  {
    component: "FactCheckSearch",
    sections: ["FactCheckSearch Module"],
  },
  {
    component: "AuthorProfile",
    sections: [
      "AuthorProfile · Vertikal (1 Autor)",
      "AuthorProfile · Horizontal (2 Autoren / Co-Autoren) · avatarSize=120",
      "AuthorProfile · Kein Avatar, kein Link",
    ],
  },
  {
    component: "TrendingItems",
    sections: [
      "TrendingItems · Alle (mit Vorschaubildern)",
      "TrendingItems · Alle (ohne Vorschaubilder)",
      "TrendingItems · Podcast (1 Treffer nach URL-Filter)",
      "TrendingItems · Leerer Zustand",
    ],
  },
  {
    component: "TrendingList",
    sections: ["TrendingList · 3 Einträge", "TrendingList · Leerer Zustand"],
  },
  {
    component: "ContentOverview",
    sections: [
      "ContentOverview · Feed (vollständig)",
      "ContentOverview · InstagramSlideshow (einzeln)",
      "ContentOverview · PodcastBanner (einzeln)",
    ],
  },
  {
    component: "CampaignProgress",
    sections: [
      "CampaignProgress · Standard",
      "CampaignProgress · Ziel erreicht",
    ],
  },
  {
    component: "CampaignDonate",
    sections: [
      "CampaignDonate · Stripe + PayPal (mit Presets)",
      "CampaignDonate · Nur Stripe",
    ],
  },
];

const Toc = () => (
  <nav
    style={{
      margin: "2rem 0",
      padding: "1.25rem 1.5rem",
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      width: "100%",
      overflow: "hidden",
    }}
  >
    {TOC_GROUPS.map(({ component, sections }) => (
      <div key={component} style={{ minWidth: 0, flexShrink: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#9ca3af",
            marginBottom: "0.4rem",
          }}
        >
          {component}
        </div>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
          }}
        >
          {sections.map((title) => {
            const variant = title.split(" · ").slice(1).join(" · ") || title;
            return (
              <li key={title}>
                <a
                  href={`#${toId(title)}`}
                  style={{
                    fontSize: 13,
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.textDecoration =
                      "underline")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.textDecoration = "none")
                  }
                >
                  {variant}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </nav>
);

const REPO_URL = "https://github.com/Volksverpetzer/vvp_divi5_extensions";

const GitHubIcon = () => (
  <svg
    height="16"
    width="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const App = () => (
  <div>
    <div
      style={{
        background: "#111827",
        color: "#9ca3af",
        fontSize: 11,
        padding: "6px 24px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <strong style={{ color: "#fff" }}>
        VVPs Divi5 Extensions for WordPress
      </strong>
      <span>Component Preview</span>
      <span>·</span>
      <span>
        {import.meta.env.PROD ? "GitHub Pages" : "Vite dev server · port 8899"}
      </span>
      <span style={{ flex: 1 }} />
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#9ca3af",
          display: "flex",
          alignItems: "center",
          gap: 5,
          textDecoration: "none",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "#fff")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "#9ca3af")
        }
      >
        <GitHubIcon />
        <span>Volksverpetzer/vvp_divi5_extensions</span>
      </a>
    </div>

    <div
      style={{
        width: "100%",
        padding: "2rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          boxSizing: "border-box",
          padding: "0 1rem",
        }}
      >
        <Toc />
        <Section title="FactCheckSearch Module">
          <div className="vvp-fc__mount" data-fc-initialized="true">
            <FactCheckSearchApp
              searchApiUrl="https://ai.volksverpetzer-app.de/api/vector-search/"
              importApiUrl="https://ai.volksverpetzer-app.de/api/import-url/"
            />
          </div>
        </Section>

        <Section title="AuthorProfile · Vertikal (1 Autor)">
          <div
            className="vvp-author-profile"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-ap__mount" data-ap-initialized="true">
              <AuthorProfileApp
                authors={AUTHOR_SINGLE}
                showAvatar
                showBio
                showLink
                layout="vertical"
                avatarSize={80}
              />
            </div>
          </div>
        </Section>

        <Section title="AuthorProfile · Horizontal (2 Autoren / Co-Autoren) · avatarSize=120">
          <div
            className="vvp-author-profile"
            style={{
              maxWidth: 760,
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
            }}
          >
            <div className="vvp-ap__mount" data-ap-initialized="true">
              <AuthorProfileApp
                authors={AUTHOR_MULTI}
                showAvatar
                showBio
                showLink
                layout="horizontal"
                avatarSize={120}
              />
            </div>
          </div>
        </Section>

        <Section title="AuthorProfile · Kein Avatar, kein Link">
          <div
            className="vvp-author-profile"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-ap__mount" data-ap-initialized="true">
              <AuthorProfileApp
                authors={AUTHOR_SINGLE}
                showAvatar={false}
                showBio
                showLink={false}
                layout="vertical"
                avatarSize={80}
              />
            </div>
          </div>
        </Section>

        <Section title="TrendingItems · Alle (mit Vorschaubildern)">
          <div
            className="vvp-trending-items"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-ti__mount" data-ti-initialized="true">
              <TrendingItemsApp items={TRENDING_ALL} />
            </div>
          </div>
        </Section>

        <Section title="TrendingItems · Alle (ohne Vorschaubilder)">
          <div
            className="vvp-trending-items"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-ti__mount" data-ti-initialized="true">
              <TrendingItemsApp
                items={TRENDING_ALL.map(({ image_url: _, ...rest }) => rest)}
              />
            </div>
          </div>
        </Section>

        <Section title="TrendingItems · Podcast (1 Treffer nach URL-Filter)">
          <div
            className="vvp-trending-items"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-ti__mount" data-ti-initialized="true">
              <TrendingItemsApp items={TRENDING_PODCAST} />
            </div>
          </div>
        </Section>

        <Section title="TrendingItems · Leerer Zustand">
          <div
            className="vvp-trending-items"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-ti__mount" data-ti-initialized="true">
              <TrendingItemsApp items={TRENDING_EMPTY} />
            </div>
          </div>
        </Section>

        <Section title="TrendingList · 3 Einträge">
          <div
            className="vvp-trending-list"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-tl__mount" data-tl-initialized="true">
              <TrendingListApp items={TRENDING_LIST_ITEMS} />
            </div>
          </div>
        </Section>

        <Section title="TrendingList · Leerer Zustand">
          <div
            className="vvp-trending-list"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-tl__mount" data-tl-initialized="true">
              <TrendingListApp items={[]} />
            </div>
          </div>
        </Section>

        <Section title="RelatedItems · Passende Artikel (3 Treffer)">
          <div
            className="vvp-related-items"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-ri__mount" data-ri-initialized="true">
              <RelatedItemsApp items={TRENDING_ALL.slice(0, 3)} />
            </div>
          </div>
        </Section>

        <Section title="RelatedItems · Keine Treffer (rendert nichts)">
          <div
            className="vvp-related-items"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <div className="vvp-ri__mount" data-ri-initialized="true">
              <RelatedItemsApp items={TRENDING_EMPTY} />
            </div>
          </div>
        </Section>

        <Section title="ContentOverview · Feed (vollständig)">
          <div className="vvp-co__wrapper">
            <div className="vvp-co__section-header">
              <h2 className="vvp-co__section-title">Das Neueste</h2>
            </div>
            <div className="vvp-co__feed-grid">
              {FEED_ARTICLES.slice(0, 3).map((a, i) => (
                <div
                  key={i}
                  className="vvp-co__feed-item"
                  data-co-kind="article"
                >
                  <div
                    className="vvp-co-article-mount"
                    data-article-initialized="true"
                  >
                    <ArticleCard {...a} />
                  </div>
                </div>
              ))}
              <div
                className="vvp-co__feed-item vvp-co__feed-item--youtube-banner"
                data-co-kind="youtube"
              >
                <div
                  className="vvp-co-yt-banner-mount"
                  data-yt-banner-initialized="true"
                >
                  <YouTubeBanner {...FEED_YT} />
                </div>
              </div>
              {FEED_ARTICLES.slice(3, 6).map((a, i) => (
                <div
                  key={i + 3}
                  className="vvp-co__feed-item"
                  data-co-kind="article"
                >
                  <div
                    className="vvp-co-article-mount"
                    data-article-initialized="true"
                  >
                    <ArticleCard {...a} />
                  </div>
                </div>
              ))}
              {FEED_IG.map((ig, i) => (
                <div
                  key={i}
                  className="vvp-co__feed-item"
                  data-co-kind="instagram"
                >
                  <div className="vvp-co-ig-mount" data-ig-initialized="true">
                    <InstagramSlideshow {...ig} />
                  </div>
                </div>
              ))}
              <div
                className="vvp-co__feed-item vvp-co__feed-item--podcast"
                data-co-kind="podcast"
              >
                <div
                  className="vvp-co-podcast-mount"
                  data-podcast-initialized="true"
                >
                  <PodcastBanner {...FEED_PODCAST} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="ContentOverview · InstagramSlideshow (einzeln)">
          <div style={{ width: "100%", maxWidth: "100%" }}>
            <InstagramSlideshow {...IG_PROPS} />
          </div>
        </Section>

        <Section title="ContentOverview · PodcastBanner (einzeln)">
          <PodcastBanner {...PODCAST_PROPS} />
        </Section>

        <Section title="CampaignProgress · Standard">
          <div
            className="vvp-campaign-progress"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <CampaignProgressApp total={62340} goal={100000} />
          </div>
        </Section>

        <Section title="CampaignProgress · Ziel erreicht">
          <div
            className="vvp-campaign-progress"
            style={{
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              boxSizing: "border-box",
            }}
          >
            <CampaignProgressApp total={104500} goal={100000} />
          </div>
        </Section>

        <Section title="CampaignDonate · Stripe + PayPal (mit Presets)">
          <div
            className="vvp-campaign-donate"
            style={{
              maxWidth: "100%",
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
            }}
          >
            <CampaignDonateApp
              apiBaseUrl="https://crowdfunding.volksverpetzer.de"
              campaignKey="flyer2026"
              stripePublicKey="pk_test_51234567890"
              paypalClientId="AWJvLVwI_example"
              presets={[10, 50, 100]}
              certificateUrl="/"
              preview
            />
          </div>
        </Section>

        <Section title="CampaignDonate · Nur Stripe">
          <div
            className="vvp-campaign-donate"
            style={{
              maxWidth: "100%",
              width: "100%",
              padding: "1.5rem",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
            }}
          >
            <CampaignDonateApp
              apiBaseUrl="https://crowdfunding.volksverpetzer.de"
              campaignKey="flyer2026"
              stripePublicKey="pk_test_01234567890"
              paypalClientId=""
              presets={[15, 30, 75, 150]}
              certificateUrl="/"
              preview
            />
          </div>
        </Section>
      </div>
    </div>
  </div>
);

createRoot(document.getElementById("root")!).render(<App />);
