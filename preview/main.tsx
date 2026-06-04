import React from "react";
import { createRoot } from "react-dom/client";
import "../src/components/fact-check-search/style.scss";
import "../src/components/content-overview/style.scss";
import "../src/components/author-profile/style.scss";
import "../src/components/trending-items/style.scss";
import { FactCheckSearchApp } from "../src/components/fact-check-search/App";
import {
  ArticleCard,
  type ArticleCardProps,
} from "../src/components/shared/ArticleCard";
import { InstagramSlideshow } from "../src/components/content-overview/InstagramSlideshow";
import { PodcastBanner } from "../src/components/content-overview/PodcastBanner";
import { YouTubeBanner } from "../src/components/content-overview/YouTubeBanner";
import { AuthorProfileApp } from "../src/components/author-profile/App";
import { TrendingItemsApp } from "../src/components/trending-items/App";

// ── Sample data ───────────────────────────────────────────────────────────────

const CATS = ["neo", "millie", "banana", "bella", "poppy", "louie"] as const;
const pimg = (seed: string, w = 640, h = 360) => {
  const cat =
    CATS[seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % CATS.length];
  return `https://placecats.com/${cat}/${w}/${h}`;
};

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

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section
    style={{
      marginBottom: "3rem",
      paddingTop: "3rem",
      borderTop: "2px dashed #e5e7eb",
    }}
  >
    <h2
      style={{
        fontSize: 13,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#6b7280",
        marginBottom: "1.5rem",
      }}
    >
      {title}
    </h2>
    {children}
  </section>
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
      <strong style={{ color: "#fff" }}>Divi5Extensions</strong>
      <span>Component Preview</span>
      <span>·</span>
      <span>Vite dev server · port 8899</span>
    </div>

    <div style={{ width: "100%", padding: "2rem 0" }}>
      <Section title="FactCheckSearch Module">
        <FactCheckSearchApp
          searchApiUrl="https://ai.volksverpetzer-app.de/api/vector-search/"
          importApiUrl="https://ai.volksverpetzer-app.de/api/import-url/"
        />
      </Section>

      <Section title="AuthorProfile · Vertikal (1 Autor)">
        <div
          className="vvp-author-profile"
          style={{
            maxWidth: 640,
            padding: "1.5rem",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          }}
        >
          <AuthorProfileApp
            authors={AUTHOR_SINGLE}
            showAvatar
            showBio
            showLink
            layout="vertical"
            avatarSize={80}
          />
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
          <AuthorProfileApp
            authors={AUTHOR_MULTI}
            showAvatar
            showBio
            showLink
            layout="horizontal"
            avatarSize={120}
          />
        </div>
      </Section>

      <Section title="AuthorProfile · Kein Avatar, kein Link">
        <div
          className="vvp-author-profile"
          style={{
            maxWidth: 640,
            padding: "1.5rem",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          }}
        >
          <AuthorProfileApp
            authors={AUTHOR_SINGLE}
            showAvatar={false}
            showBio
            showLink={false}
            layout="vertical"
            avatarSize={80}
          />
        </div>
      </Section>

      <Section title="TrendingItems · Alle (mit Vorschaubildern)">
        <div
          className="vvp-trending-items"
          style={{
            maxWidth: 480,
            padding: "1.5rem",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          }}
        >
          <TrendingItemsApp items={TRENDING_ALL} />
        </div>
      </Section>

      <Section title="TrendingItems · Alle (ohne Vorschaubilder)">
        <div
          className="vvp-trending-items"
          style={{
            maxWidth: 480,
            padding: "1.5rem",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          }}
        >
          <TrendingItemsApp
            items={TRENDING_ALL.map(({ image_url: _, ...rest }) => rest)}
          />
        </div>
      </Section>

      <Section title="TrendingItems · Podcast (1 Treffer nach URL-Filter)">
        <div
          className="vvp-trending-items"
          style={{
            maxWidth: 480,
            padding: "1.5rem",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          }}
        >
          <TrendingItemsApp items={TRENDING_PODCAST} />
        </div>
      </Section>

      <Section title="TrendingItems · Leerer Zustand">
        <div
          className="vvp-trending-items"
          style={{
            maxWidth: 480,
            padding: "1.5rem",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          }}
        >
          <TrendingItemsApp items={TRENDING_EMPTY} />
        </div>
      </Section>

      <Section title="ContentOverview · Feed (vollständig)">
        <div className="vvp-co__wrapper">
          <div className="vvp-co__section-header">
            <h2 className="vvp-co__section-title">Das Neueste</h2>
          </div>
          <div className="vvp-co__feed-grid">
            {FEED_ARTICLES.slice(0, 3).map((a, i) => (
              <div key={i} className="vvp-co__feed-item">
                <ArticleCard {...a} />
              </div>
            ))}
            <div className="vvp-co__feed-item vvp-co__feed-item--youtube-banner">
              <YouTubeBanner {...FEED_YT} />
            </div>
            {FEED_ARTICLES.slice(3, 6).map((a, i) => (
              <div key={i + 3} className="vvp-co__feed-item">
                <ArticleCard {...a} />
              </div>
            ))}
            {FEED_IG.map((ig, i) => (
              <div key={i} className="vvp-co__feed-item">
                <InstagramSlideshow {...ig} />
              </div>
            ))}
            <div className="vvp-co__feed-item vvp-co__feed-item--podcast">
              <PodcastBanner {...FEED_PODCAST} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="ContentOverview · InstagramSlideshow (einzeln)">
        <div style={{ maxWidth: 360 }}>
          <InstagramSlideshow {...IG_PROPS} />
        </div>
      </Section>

      <Section title="ContentOverview · PodcastBanner (einzeln)">
        <PodcastBanner {...PODCAST_PROPS} />
      </Section>
    </div>
  </div>
);

createRoot(document.getElementById("root")!).render(<App />);
