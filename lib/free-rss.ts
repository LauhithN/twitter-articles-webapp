import type { Article } from './types';

// ─── X.com authors to monitor ────────────────────────────────────────

const ARTICLE_AUTHORS = [
  'mattshumer_',
  'thedankoe',
  'naval',
  'alexhormozi',
  'levelsio',
  'karpathy',
  'JamesClear',
  'SahilBloom',
  'waitbutwhy',
  'david_perell',
  'dickiebush',
  'Nicolascole77',
  'george__mack',
];

const RECENT_ARTICLE_WINDOW_DAYS = 7;
const SYNDICATION_TIMELINE_URL = 'https://syndication.twitter.com/srv/timeline-profile/screen-name';

// ─── Types for the syndication response ──────────────────────────────

interface SyndicationUser {
  name?: string;
  screen_name?: string;
  profile_image_url_https?: string;
}

interface SyndicationTweet {
  id_str?: string;
  text?: string;
  full_text?: string;
  created_at?: string;
  favorite_count?: number;
  retweet_count?: number;
  reply_count?: number;
  user?: SyndicationUser;
  entities?: {
    urls?: Array<{ expanded_url?: string }>;
  };
  in_reply_to_status_id_str?: string | null;
}

interface TimelineEntry {
  type?: string;
  content?: {
    tweet?: SyndicationTweet;
  };
}

interface SyndicationPageData {
  props?: {
    pageProps?: {
      timeline?: {
        entries?: TimelineEntry[];
      };
    };
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 3).trimEnd() + '...';
}

function parseTweetDate(dateStr: string): Date | null {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function isArticleRecent(article: Article, maxAgeDays: number): boolean {
  const publishedAt = new Date(article.first_seen_at);
  if (Number.isNaN(publishedAt.getTime())) return false;
  const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  return publishedAt.getTime() >= cutoffMs;
}

// ─── Convert syndication tweet to Article ────────────────────────────

function tweetToArticle(tweet: SyndicationTweet): Article | null {
  if (!tweet.id_str) return null;

  const screenName = tweet.user?.screen_name;
  if (!screenName) return null;

  const rawText = tweet.text || tweet.full_text || '';
  const text = decodeHtmlEntities(rawText);
  if (!text) return null;

  const createdAt = tweet.created_at ? parseTweetDate(tweet.created_at) : null;
  if (!createdAt) return null;

  const now = new Date().toISOString();

  return {
    id: tweet.id_str,
    url: `https://x.com/${screenName}/status/${tweet.id_str}`,
    title: truncate(text, 220),
    domain: 'x.com',
    tweet_count: 1,
    likes: tweet.favorite_count ?? 0,
    retweets: tweet.retweet_count ?? 0,
    impressions: 0,
    bookmarks: 0,
    shares: 0,
    author_name: tweet.user?.name || screenName,
    author_username: screenName,
    author_url: `https://x.com/${screenName}`,
    first_seen_at: createdAt.toISOString(),
    last_updated_at: now,
    preview_image: tweet.user?.profile_image_url_https || null,
    description: text.length > 220 ? truncate(text, 500) : null,
  };
}

// ─── Fetch timeline for a single author ──────────────────────────────

async function fetchAuthorTimeline(username: string): Promise<Article[]> {
  const url = `${SYNDICATION_TIMELINE_URL}/${username}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      console.error(`[free-rss] ${username}: HTTP ${response.status} ${response.statusText}`);
      return [];
    }

    const html = await response.text();

    // Extract __NEXT_DATA__ JSON blob
    const nextDataPattern = /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i;
    const match = html.match(nextDataPattern);
    if (!match || !match[1]) {
      console.error(`[free-rss] ${username}: No __NEXT_DATA__ found (html length: ${html.length})`);
      return [];
    }

    let pageData: SyndicationPageData;
    try {
      pageData = JSON.parse(match[1]);
    } catch {
      console.error(`[free-rss] ${username}: Failed to parse __NEXT_DATA__ JSON`);
      return [];
    }

    const entries = pageData?.props?.pageProps?.timeline?.entries ?? [];
    const articles: Article[] = [];

    for (const entry of entries) {
      if (entry.type !== 'tweet') continue;

      const tweet = entry.content?.tweet;
      if (!tweet) continue;

      // Skip replies to other users
      if (tweet.in_reply_to_status_id_str) continue;

      const article = tweetToArticle(tweet);
      if (article) articles.push(article);
    }

    console.log(`[free-rss] ${username}: fetched ${articles.length} tweets`);
    return articles;
  } catch (err) {
    console.error(`[free-rss] ${username}: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

// ─── Main export ─────────────────────────────────────────────────────

export async function fetchFreshArticlesFromRss(
  limit: number = 50,
  maxAgeDays: number = RECENT_ARTICLE_WINDOW_DAYS
): Promise<Article[]> {
  const results = await Promise.allSettled(
    ARTICLE_AUTHORS.map(username => fetchAuthorTimeline(username))
  );

  const deduped = new Map<string, Article>();

  for (const result of results) {
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
      const scoreA = a.likes + a.retweets * 2;
      const scoreB = b.likes + b.retweets * 2;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime();
    })
    .slice(0, limit);
}
