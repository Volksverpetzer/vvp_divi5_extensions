"use client";

import useSWR from "swr";
import { WpPost, InstaPost, YtVideo, PodcastItem, FeedItem } from "@/lib/types";
import { ArticleCard } from "./article-card";
import { InstaCard } from "./insta-card";
import { YoutubeCard } from "./youtube-card";
import { PodcastBanner } from "./podcast-banner";
import { TrendingBar } from "./trending-bar";
import { Newspaper } from "lucide-react";
import { TrendingPage } from "@/app/api/trending/route";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getSlug(page: string) {
  return page.replace(/\/$/, "").split("/").pop() ?? "";
}

const YT_INTERLEAVE_DAYS = 14;
const PODCAST_BANNER_DAYS = 7;
const TARGET_WEITERE_ITEMS = 18;
const FEED_ROW_SIZE = 3;

type AnyFeedItem =
  | FeedItem
  | { kind: "podcast_banner"; data: PodcastItem; date: Date };
type FeedRow = {
  items: AnyFeedItem[];
  date: Date;
};

function daysAgo(date: Date) {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

function groupFeedRows(items: FeedItem[], rowSize: number): FeedRow[] {
  const instaQueue: FeedItem[] = [];
  const mixedQueue: FeedItem[] = [];
  const grouped: FeedRow[] = [];

  const flushChunk = (queue: FeedItem[], size: number) => {
    if (queue.length < size) return;
    const chunk = queue.splice(0, size);
    grouped.push({ items: chunk, date: chunk[0].date });
  };

  for (const item of items) {
    if (item.kind === "insta") {
      instaQueue.push(item);
      flushChunk(instaQueue, rowSize);
      continue;
    }

    mixedQueue.push(item);
    flushChunk(mixedQueue, rowSize);
  }

  const leftovers = [
    { kind: "insta", items: instaQueue },
    { kind: "mixed", items: mixedQueue },
  ]
    .filter((group) => group.items.length > 0)
    .sort((a, b) => b.items[0].date.getTime() - a.items[0].date.getTime());

  for (const group of leftovers) {
    grouped.push({ items: [...group.items], date: group.items[0].date });
  }

  return grouped.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function ArticlesSection() {
  const { data: vpData, isLoading: vpLoading } = useSWR<WpPost[]>(
    "/api/wordpress?source=volksverpetzer&per_page=12&pages=3&_embed=1",
    fetcher,
  );
  const { data: ppData, isLoading: ppLoading } = useSWR<WpPost[]>(
    "/api/wordpress?source=pruefpunkt&per_page=10&pages=2&_embed=1",
    fetcher,
  );
  const { data: instaData } = useSWR<{ data: InstaPost[] }>(
    "/api/instagram",
    fetcher,
  );
  const { data: ytData } = useSWR<{ items: YtVideo[] }>(
    "/api/youtube",
    fetcher,
  );
  const { data: podcastData } = useSWR<{
    items: PodcastItem[];
    channelImage: string;
  }>("/api/podcast", fetcher);
  const { data: trendingData } = useSWR<{ results: TrendingPage[] }>(
    "/api/trending",
    fetcher,
  );

  const isLoading = vpLoading || ppLoading;

  const vpPosts: WpPost[] = (vpData ?? []).map((p) => ({
    ...p,
    source: "volksverpetzer" as const,
  }));
  const ppPosts: WpPost[] = (ppData ?? []).map((p) => ({
    ...p,
    source: "pruefpunkt" as const,
  }));
  const allArticles = [...vpPosts, ...ppPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Build set of post IDs that are shown in "Meistgelesen" so we can exclude them from "Weitere Beiträge"
  const trendingPostIds = new Set<number>();
  if (trendingData?.results) {
    const allPosts = [...vpPosts, ...ppPosts];
    for (const page of trendingData.results) {
      const slug = getSlug(page.page);
      const match = allPosts.find((p) => slug && p.link.includes(slug));
      if (match) trendingPostIds.add(match.id);
    }
  }

  const hero = allArticles[0];
  const sidebarArticles = allArticles.slice(1, 7);

  const remainingArticles: FeedItem[] = allArticles
    .slice(7)
    .filter((p) => !trendingPostIds.has(p.id))
    .map((p) => ({
      kind: "article",
      date: new Date(p.date),
      data: p,
    }));

  const recentInsta: FeedItem[] = (instaData?.data ?? [])
    .filter((p) => p.timestamp)
    .map((p) => ({ kind: "insta", date: new Date(p.timestamp!), data: p }));

  const recentYt: FeedItem[] = (ytData?.items ?? [])
    .filter(
      (v) =>
        v.publishedAt && daysAgo(new Date(v.publishedAt)) <= YT_INTERLEAVE_DAYS,
    )
    .slice(0, 4)
    .map((v) => ({ kind: "youtube", date: new Date(v.publishedAt), data: v }));

  const mergedFeed: FeedItem[] = [
    ...remainingArticles,
    ...recentInsta,
    ...recentYt,
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, TARGET_WEITERE_ITEMS);

  const groupedFeedRows = groupFeedRows(mergedFeed, FEED_ROW_SIZE);

  const latestEpisode = podcastData?.items?.[0];
  const latestEpisodeDate = latestEpisode?.pubDate
    ? new Date(latestEpisode.pubDate)
    : null;
  const podcastIsRecent =
    latestEpisode?.pubDate &&
    daysAgo(new Date(latestEpisode.pubDate)) <= PODCAST_BANNER_DAYS;

  const feedRows: FeedRow[] = [...groupedFeedRows];
  if (
    latestEpisode &&
    latestEpisodeDate &&
    !Number.isNaN(latestEpisodeDate.getTime())
  ) {
    const podcastRow: FeedRow = {
      items: [
        {
          kind: "podcast_banner",
          data: latestEpisode,
          date: latestEpisodeDate,
        },
      ],
      date: latestEpisodeDate,
    };

    if (podcastIsRecent) {
      const insertIdx = feedRows.findIndex(
        (row) => row.date.getTime() < latestEpisodeDate.getTime(),
      );
      if (insertIdx === -1) {
        feedRows.push(podcastRow);
      } else {
        feedRows.splice(insertIdx, 0, podcastRow);
      }
    } else {
      feedRows.push(podcastRow);
    }
  }

  feedRows.sort((a, b) => b.date.getTime() - a.date.getTime());

  const feedWithPodcast = feedRows.flatMap((row) => row.items);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="min-w-0 lg:col-span-2">
          {isLoading ? (
            <div className="aspect-[16/9] rounded-lg bg-muted animate-pulse" />
          ) : hero ? (
            <ArticleCard post={hero} variant="hero" />
          ) : null}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper size={14} className="text-[var(--brand-blue-main)]" />
            <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Neueste Artikel
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              {sidebarArticles.map((post) => (
                <ArticleCard
                  key={`${post.source}-${post.id}`}
                  post={post}
                  variant="compact"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trending section — between hero and feed */}
      <TrendingBar vpPosts={vpPosts} ppPosts={ppPosts} />

      {/* Chronological interleaved feed */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          Weitere Beiträge
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-muted animate-pulse aspect-[4/3]"
            />
          ))}
        </div>
      ) : (
        <FeedGrid
          items={feedWithPodcast}
          podcastChannelImage={podcastData?.channelImage ?? ""}
        />
      )}
    </main>
  );
}

// ─── Feed grid ────────────────────────────────────────────────────────────────

function FeedGrid({
  items,
  podcastChannelImage,
}: {
  items: AnyFeedItem[];
  podcastChannelImage: string;
}) {
  const separatorBaseClass =
    "relative pt-5 before:absolute before:top-0 before:left-3 before:right-3 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border/70 before:to-transparent";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-6">
      {items.map((item, idx) => {
        const withSeparator =
          idx === 0
            ? ""
            : idx === 1
              ? `${separatorBaseClass} sm:before:hidden sm:pt-0`
              : idx === 2
                ? `${separatorBaseClass} lg:before:hidden lg:pt-0`
                : separatorBaseClass;

        if (item.kind === "podcast_banner") {
          return (
            <div
              key={`podcast-banner-${idx}`}
              className={`sm:col-span-2 lg:col-span-3 ${withSeparator}`}
            >
              <PodcastBanner
                episode={item.data}
                channelImage={podcastChannelImage}
              />
            </div>
          );
        }
        if (item.kind === "article") {
          return (
            <div
              key={`article-${item.data.source}-${item.data.id}`}
              className={withSeparator}
            >
              <ArticleCard post={item.data} variant="featured" />
            </div>
          );
        }
        if (item.kind === "insta") {
          return (
            <div key={`insta-${item.data.id}-${idx}`} className={withSeparator}>
              <InstaCard
                post={item.data}
                carouselItems={item.data.children}
                variant="featured"
              />
            </div>
          );
        }
        if (item.kind === "youtube") {
          return (
            <div key={`yt-${item.data.id}-${idx}`} className={withSeparator}>
              <YoutubeCard video={item.data} variant="featured" />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
