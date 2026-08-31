// Deterministic sample data reused across Storybook stories so every
// module's example content stays visually consistent and non-empty.
import { type ArticleCardProps } from "./ArticleCard";
import { catPlaceholderImage as pimg } from "./catPlaceholder";
import { beardPlaceholderImage as bimg } from "./beardPlaceholder";

export const TRENDING_ALL: ArticleCardProps[] = [
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

export const TRENDING_PODCAST: ArticleCardProps[] = [
  {
    title:
      "Podcast – Folge 47: Wie Katzen das Internet und unsere Meinung formen",
    link: "/podcast/katzen-internet/",
    image_url: pimg("trpod", 320, 320),
    date: "3. Mai 2026",
  },
];

export const TRENDING_EMPTY: ArticleCardProps[] = [];

export const TRENDING_LIST_ITEMS = [
  {
    title:
      "Nein, diese Katze hat das Sofa NICHT selbst zerkratzt – der Fell-Check",
    link: "#sofa-fell-check",
    date: "8. Mai 2026",
    authors: ["Whisker Pfotenhauer", "Bella Kratzenbach"],
  },
  {
    title:
      "Schnurren macht NICHT unsterblich: Warum dieser Viral-Post falsch liegt",
    link: "#schnurren-unsterblich",
    date: "7. Mai 2026",
    authors: ["Whisker Pfotenhauer"],
  },
  {
    title: "Faktencheck: Warum Katzen Gurken NICHT wirklich hassen",
    link: "#gurken-faktencheck",
    date: "6. Mai 2026",
    authors: ["Bella Kratzenbach"],
  },
];

export const AUTHOR_SINGLE = [
  {
    name: "Whisker Pfotenhauer",
    bio: "Chefredakteur und leitender Schnurrhaar-Analyst bei Volksverpetzer.<br />\nSchreibt über Mäuse, Desinformation und das Phänomen des Karton-Sitzens.<br />\nSeit 2017 bei Volksverpetzer, vorher hauptberuflich Sofa-Bewacher.",
    avatarUrl: pimg("avatar-whisker", 150, 150),
    profileUrl: "#",
  },
];

export const AUTHOR_MULTI = [
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

export const IG_PROPS = {
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

export const PODCAST_PROPS = {
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

export const FEED_ARTICLES: ArticleCardProps[] = [
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
    title: "Bartöl-Mythen: Was stimmt wirklich an den Wirkstoffen?",
    excerpt:
      "Der Stoppel-Check zur aktuellen Debatte über Öl- versus Wachspflege. Trotz eindeutiger Datenlage werden die Zahlen regelmäßig falsch interpretiert oder bewusst durchs Kinnhaar gezogen.",
    link: "#",
    date: "15.05.2026",
    reading_time: 3,
    category: "Faktencheck",
    category_link: "#",
    source: "pruefpunkt",
    image_url: bimg(640, 360),
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
    title: "Wachstumsmythen im Stoppel-Check 2026",
    excerpt:
      "Welche Falschbehauptungen über Bartwuchsmittel kursieren aktuell und was sagen Dermatologinnen dazu? Wir haben die häufigsten Behauptungen geprüft und eingeordnet.",
    link: "#",
    date: "12.05.2026",
    reading_time: 4,
    category: "Gesundheit",
    category_link: "#",
    source: "pruefpunkt",
    image_url: bimg(641, 360),
  },
];

export const FEED_IG = [
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

export const FEED_YT = {
  videoId: "",
  title: "Fell-Check: Die größten Katzen-Mythen der Woche",
  description:
    "In diesem Video beleuchten wir die meistgeteilten Falschinformationen über Katzen der letzten Woche und erklären, was wirklich dahintersteckt. Mit konkreten Quellen und verständlichen Schnurr-Erklärungen.",
  date: "Vor 2 Tagen",
  thumbnailUrl: pimg("katze-yt", 1280, 720),
};

export const FEED_YT_2 = {
  videoId: "",
  title: "Kurzclip: Warum Katzen nicht wirklich neun Leben haben",
  description:
    "Ein kurzer Blick auf die Herkunft dieses Mythos und was Tierärzte tatsächlich dazu sagen.",
  date: "Vor 5 Tagen",
  thumbnailUrl: pimg("katze-yt2", 1280, 720),
};

export const FEED_PODCAST = {
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
