import type { Article } from './types';

// ─── Free RSS & API sources (no API keys required) ──────────────────

const GOOGLE_NEWS_QUERIES = [
  'artificial intelligence technology',
  'startup entrepreneurship founder',
  'software engineering programming',
  'tech business innovation',
  'AI machine learning',
];

const DIRECT_RSS_FEEDS = [
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica' },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired' },
];

const RECENT_ARTICLE_WINDOW_DAYS = 7;

// ─── XML helpers ─────────────────────────────────────────────────────

interface RssItem {
  title: string;
  link: string;
  description: string;
  creator: string | null;
  pubDate: string | null;
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 3).trimEnd() + '...';
}

function extractTagValue(block: string, tagName: string): string | null {
  const safeTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tagPattern = new RegExp(`<${safeTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safeTag}>`, 'i');
  const match = block.match(tagPattern);
  if (!match || !match[1]) return null;

  let value = match[1].trim();
  if (value.startsWith('<![CDATA[') && value.endsWith(']]>')) {
    value = value.slice(9, -3);
  }

  return decodeXmlEntities(value.trim());
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi;

  for (const match of Array.from(xml.matchAll(itemPattern))) {
    const block = match[1];
    if (!block) continue;

    const title = extractTagValue(block, 'title') ?? '';
    const link = extractTagValue(block, 'link') ?? '';
    const description = extractTagValue(block, 'description') ?? '';
    const creator =
      extractTagValue(block, 'dc:creator') ??
      extractTagValue(block, 'creator') ??
      extractTagValue(block, 'source') ??
      null;
    const pubDate = extractTagValue(block, 'pubDate');

    if (!link || !title) continue;

    items.push({
      title: title.trim(),
      link: link.trim(),
      description: description.trim(),
      creator: creator?.trim() ?? null,
      pubDate: pubDate?.trim() ?? null,
    });
  }

  return items;
}

// ─── Shared helpers ──────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

function buildArticleFromRssItem(item: RssItem, feedSource: string): Article | null {
  if (!item.link || !item.title) return null;

  const now = new Date().toISOString();
  let publishedAt = now;
  if (item.pubDate) {
    const d = new Date(item.pubDate);
    if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
  }

  const domain = extractDomain(item.link);
  const description = item.description ? stripHtml(item.description) : null;
  const authorName = item.creator || feedSource;

  return {
    id: item.link,
    url: item.link,
    title: truncate(stripHtml(item.title), 220),
    domain,
    tweet_count: 0,
    likes: 0,
    retweets: 0,
    impressions: 0,
    bookmarks: 0,
    shares: 0,
    author_name: authorName,
    author_username: feedSource.toLowerCase().replace(/\s+/g, ''),
    author_url: null,
    first_seen_at: publishedAt,
    last_updated_at: now,
    preview_image: null,
    description: description ? truncate(description, 500) : null,
  };
}

function isArticleRecent(article: Article, maxAgeDays: number): boolean {
  const publishedAt = new Date(article.first_seen_at);
  if (Number.isNaN(publishedAt.getTime())) return false;

  const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  return publishedAt.getTime() >= cutoffMs;
}

// ─── RSS feed fetcher ────────────────────────────────────────────────

async function fetchRssFeed(feedUrl: string, source: string): Promise<Article[]> {
  try {
    const response = await fetch(feedUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ViralArticles/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    return parseRssItems(xml)
      .map(item => buildArticleFromRssItem(item, source))
      .filter((a): a is Article => a !== null);
  } catch {
    return [];
  }
}

// ─── Google News RSS ─────────────────────────────────────────────────

async function fetchGoogleNewsArticles(): Promise<Article[]> {
  const fetches = GOOGLE_NEWS_QUERIES.map(query => {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`;
    return fetchRssFeed(url, 'Google News');
  });

  const settled = await Promise.allSettled(fetches);
  const results: Article[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') results.push(...result.value);
  }
  return results;
}

// ─── Dev.to API (free, no auth) ─────────────────────────────────────

interface DevToArticle {
  id: number;
  title: string;
  url: string;
  description: string;
  user: { name: string; username: string };
  positive_reactions_count: number;
  comments_count: number;
  published_at: string;
  cover_image: string | null;
}

async function fetchDevToArticles(): Promise<Article[]> {
  try {
    const response = await fetch('https://dev.to/api/articles?per_page=20&top=7', {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ViralArticles/1.0)',
      },
    });

    if (!response.ok) return [];

    const data: DevToArticle[] = await response.json();
    const now = new Date().toISOString();

    return data.map(item => ({
      id: String(item.id),
      url: item.url,
      title: truncate(item.title, 220),
      domain: 'dev.to',
      tweet_count: 0,
      likes: item.positive_reactions_count ?? 0,
      retweets: item.comments_count ?? 0,
      impressions: 0,
      bookmarks: 0,
      shares: 0,
      author_name: item.user?.name ?? 'Dev.to Author',
      author_username: item.user?.username ?? 'devto',
      author_url: item.user ? `https://dev.to/${item.user.username}` : null,
      first_seen_at: item.published_at ?? now,
      last_updated_at: now,
      preview_image: item.cover_image ?? null,
      description: item.description ? truncate(item.description, 500) : null,
    }));
  } catch {
    return [];
  }
}

// ─── Hacker News API (free, no auth) ────────────────────────────────

interface HNItem {
  id: number;
  title: string;
  url?: string;
  by: string;
  score: number;
  time: number;
  descendants?: number;
}

async function fetchHackerNewsArticles(count: number = 20): Promise<Article[]> {
  try {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });

    if (!topRes.ok) return [];

    const topIds: number[] = await topRes.json();

    const itemPromises = topIds.slice(0, count).map(async (id): Promise<Article | null> => {
      try {
        const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(5_000),
        });
        if (!res.ok) return null;

        const item: HNItem = await res.json();
        if (!item.url || !item.title) return null;

        const now = new Date().toISOString();
        const publishedAt = item.time ? new Date(item.time * 1000).toISOString() : now;

        return {
          id: String(item.id),
          url: item.url,
          title: truncate(item.title, 220),
          domain: extractDomain(item.url),
          tweet_count: 0,
          likes: item.score ?? 0,
          retweets: item.descendants ?? 0,
          impressions: 0,
          bookmarks: 0,
          shares: 0,
          author_name: item.by ?? 'HN User',
          author_username: item.by ?? 'hn',
          author_url: item.by ? `https://news.ycombinator.com/user?id=${item.by}` : null,
          first_seen_at: publishedAt,
          last_updated_at: now,
          preview_image: null,
          description: null,
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.allSettled(itemPromises);
    return results
      .filter((r): r is PromiseFulfilledResult<Article | null> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter((a): a is Article => a !== null);
  } catch {
    return [];
  }
}

// ─── Main export ─────────────────────────────────────────────────────

export async function fetchFreshArticlesFromRss(
  limit: number = 50,
  maxAgeDays: number = RECENT_ARTICLE_WINDOW_DAYS
): Promise<Article[]> {
  const allSettled = await Promise.allSettled([
    fetchDevToArticles(),
    fetchHackerNewsArticles(20),
    fetchGoogleNewsArticles(),
    ...DIRECT_RSS_FEEDS.map(feed => fetchRssFeed(feed.url, feed.source)),
  ]);

  const deduped = new Map<string, Article>();

  for (const result of allSettled) {
    if (result.status !== 'fulfilled') continue;

    for (const article of result.value) {
      if (!deduped.has(article.url)) {
        deduped.set(article.url, article);
      }
    }
  }

  return Array.from(deduped.values())
    .filter(a => isArticleRecent(a, maxAgeDays))
    .sort((a, b) => {
      // Engagement score first (HN/Dev.to have real scores), then recency
      const scoreA = a.likes + a.retweets * 2;
      const scoreB = b.likes + b.retweets * 2;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime();
    })
    .slice(0, limit);
}
