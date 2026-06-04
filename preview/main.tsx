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
    title: "Nein, dieser Politiker hat das nicht gesagt – der Faktencheck",
    link: "/faktencheck/politiker-zitat-gefaelscht/",
    image_url: pimg("tr1", 320, 240),
    date: "1. Mai 2026",
    category: "Faktencheck",
  },
  {
    title: "5 Mythen über Impfstoffe — und was die Wissenschaft dazu sagt",
    link: "/faktencheck/mythen-impfstoffe/",
    image_url: pimg("tr2", 320, 240),
    date: "28. April 2026",
    category: "Faktencheck",
  },
  {
    title: "Warum dieser virale Post über Geflüchtete komplett falsch ist",
    link: "/desinformation/viral-post-gefluchtete/",
    image_url: pimg("tr3", 320, 240),
    date: "25. April 2026",
    category: "Desinformation",
  },
  {
    title: "Klimaschutz: Was die Zahlen wirklich sagen – und was nicht",
    link: "/faktencheck/klimaschutz-zahlen/",
    image_url: pimg("tr4", 320, 240),
    date: "20. April 2026",
    category: "Analyse",
  },
  {
    title: "So funktioniert Desinformation im Wahlkampf",
    link: "/desinformation/wahlkampf-mechanismen/",
    image_url: pimg("tr5", 320, 240),
    date: "15. April 2026",
    category: "Medien",
  },
];

const TRENDING_PODCAST: ArticleCardProps[] = [
  {
    title: "Podcast – Folge 47: Wie Algorithmen unsere Meinung formen",
    link: "/podcast/algorithmen-meinung/",
    image_url: pimg("trpod", 320, 320),
    date: "3. Mai 2026",
  },
];

const TRENDING_EMPTY: ArticleCardProps[] = [];

const AUTHOR_SINGLE = [
  {
    name: "Thomas Laschyk",
    bio: "Gründer und Chefredakteur von Volksverpetzer.<br />\nSchreibt über Desinformation, Rechtsextremismus und die Krise der Demokratie.<br />\nSeit 2017 bei Volksverpetzer.",
    avatarUrl: pimg("avatar-thomas", 150, 150),
    profileUrl: "#",
  },
];

const AUTHOR_MULTI = [
  {
    name: "Thomas Laschyk",
    bio: "Gründer und Chefredakteur. Schwerpunkt: Rechtsextremismus und politische Desinformation.",
    avatarUrl: pimg("avatar-thomas", 150, 150),
    profileUrl: "#",
  },
  {
    name: "Sara Steinert",
    bio: "Redakteurin und Faktencheckerin. Spezialisiert auf Social-Media-Manipulation und Gesundheitsmythen.",
    avatarUrl: pimg("avatar-sara", 150, 150),
    profileUrl: "#",
  },
];

const IG_PROPS = {
  permalink: "https://www.instagram.com/volksverpetzer/",
  caption:
    "❌ FALSCH: Diese Behauptung kursiert gerade massenhaft – wir haben sie gecheckt. Hier sind die Fakten 👇 Speichern & teilen, damit dein Umfeld es auch weiß! #Faktenfuchs #Desinformation #Faktencheck",
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
  title: "Volksverpetzer Podcast – Folge 47: Rechtsextremismus im Netz",
  link: "https://volksverpetzer.de/podcast/",
  enclosure: "https://cdn.podigee.com/media/podcast_episode_example.mp3",
  date: "3. Mai 2026",
  duration: "52:14",
  summary:
    "Wie radikalisieren sich Menschen online, und was können wir dagegen tun? Wir sprechen mit Expert:innen über Prävention, Plattformverantwortung und die Rolle der Zivilgesellschaft.",
  artworkUrl: pimg("podcast", 120, 120),
};

// ── ContentOverview feed mock data ───────────────────────────────────────────

const FEED_ARTICLES: ArticleCardProps[] = [
  {
    title: "Warum Fakten mehr zählen als Gefühle",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    link: "#",
    date: "17.05.2026",
    reading_time: 4,
    category: "Analyse",
    category_link: "#",
    source: "volksverpetzer",
    image_url: pimg("politik1"),
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
    source: "volksverpetzer",
    image_url: pimg("news2"),
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
    source: "pruefpunkt",
    image_url: pimg("nature3"),
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
    source: "volksverpetzer",
    image_url: pimg("tech4"),
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
    source: "volksverpetzer",
    image_url: pimg("people5"),
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
    source: "pruefpunkt",
    image_url: pimg("health6"),
  },
];

const FEED_IG = [
  {
    permalink: "#",
    caption:
      "Wusstet ihr das? Hier sind fünf Fakten, die ihr kennen solltet 👇 #Faktenfuchs #Medienkompetenz",
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
      "So erkennst du Fake News auf einen Blick 🔍 Teile diesen Post mit jemandem, der das wissen sollte!",
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
      "Danke für 500.000 Follower! 💙 Gemeinsam gegen Desinformation – das ist möglich.",
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
  title: "Faktencheck: Die größten Mythen der Woche",
  description:
    "In diesem Video beleuchten wir die meistgeteilten Falschinformationen der letzten Woche und erklären, was wirklich dahintersteckt. Mit konkreten Quellen und verständlichen Erklärungen.",
  date: "Vor 2 Tagen",
  thumbnailUrl: pimg("youtube1", 1280, 720),
};

const FEED_PODCAST = {
  title: "Volksverpetzer Podcast – Folge 47: Rechtsextremismus im Netz",
  link: "#",
  enclosure: "",
  date: "03. Mai 2026",
  duration: "52 Min.",
  summary:
    "Wie radikalisieren sich Menschen online, und was können wir dagegen tun? Wir sprechen mit Expert:innen über Prävention, Plattformverantwortung und die Rolle der Zivilgesellschaft.",
  artworkUrl: pimg("podcast1", 100, 100),
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
