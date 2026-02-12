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

const RECENT_ARTICLE_WINDOW_DAYS = 14;
const SYNDICATION_TIMELINE_URL = 'https://syndication.twitter.com/srv/timeline-profile/screen-name';

// ─── In-memory cache to prevent articles from disappearing ───────────

interface ArticleCache {
  articles: Map<string, Article>;
  lastSuccessfulFetch: number;
}

const articleCache: ArticleCache = {
  articles: new Map(),
  lastSuccessfulFetch: 0,
};

const CACHE_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

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

// ─── Extract tweet from any entry shape ──────────────────────────────

function extractTweetFromEntry(entry: unknown): SyndicationTweet | null {
  if (!entry || typeof entry !== 'object') return null;

  const obj = entry as Record<string, unknown>;

  // Standard path: entry.content.tweet
  if (obj.content && typeof obj.content === 'object') {
    const content = obj.content as Record<string, unknown>;
    if (content.tweet && typeof content.tweet === 'object') {
      return content.tweet as SyndicationTweet;
    }
  }

  // Alt path: entry itself might be a tweet-like object
  if (obj.id_str && (obj.text || obj.full_text)) {
    return obj as unknown as SyndicationTweet;
  }

  // Alt path: entry.tweet directly
  if (obj.tweet && typeof obj.tweet === 'object') {
    return obj.tweet as SyndicationTweet;
  }

  return null;
}

// ─── Parse page data with multiple strategies ────────────────────────

function extractArticlesFromPageData(json: unknown, username: string): Article[] {
  const articles: Article[] = [];
  if (!json || typeof json !== 'object') return articles;

  const root = json as Record<string, unknown>;

  // Strategy 1: Standard __NEXT_DATA__ path
  const props = root.props as Record<string, unknown> | undefined;
  const pageProps = props?.pageProps as Record<string, unknown> | undefined;
  const timeline = pageProps?.timeline as Record<string, unknown> | undefined;
  let entries = timeline?.entries as unknown[] | undefined;

  // Strategy 2: Try alternate paths if standard path yields nothing
  if (!entries || entries.length === 0) {
    // Try timeline at root level
    const rootTimeline = root.timeline as Record<string, unknown> | undefined;
    entries = rootTimeline?.entries as unknown[] | undefined;
  }

  if (!entries || entries.length === 0) {
    // Try props.pageProps.data.entries
    const data = pageProps?.data as Record<string, unknown> | undefined;
    entries = data?.entries as unknown[] | undefined;
  }

  if (!entries || !Array.isArray(entries)) {
    console.warn(`[free-rss] ${username}: No entries found in page data`);
    return articles;
  }

  for (const entry of entries) {
    const entryObj = entry as TimelineEntry;

    // Accept entries of type 'tweet' or entries with no type but containing tweet data
    if (entryObj.type && entryObj.type !== 'tweet') continue;

    const tweet = extractTweetFromEntry(entry);
    if (!tweet) continue;

    // Skip replies to other users
    if (tweet.in_reply_to_status_id_str) continue;

    const article = tweetToArticle(tweet);
    if (article) articles.push(article);
  }

  return articles;
}

// ─── Fetch timeline for a single author ──────────────────────────────

async function fetchAuthorTimeline(username: string): Promise<Article[]> {
  const url = `${SYNDICATION_TIMELINE_URL}/${username}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`[free-rss] ${username}: HTTP ${response.status} ${response.statusText}`);
      return [];
    }

    const html = await response.text();

    // Try __NEXT_DATA__ script tag first
    const nextDataPattern = /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i;
    let match = html.match(nextDataPattern);

    // Fallback: try any script tag containing timeline data
    if (!match || !match[1]) {
      const genericPattern = /<script[^>]*>([\s\S]*?"timeline"[\s\S]*?)<\/script>/i;
      match = html.match(genericPattern);
    }

    if (!match || !match[1]) {
      // Last resort: try to find JSON blob in the HTML
      const jsonBlobPattern = /\{[\s\S]*"timeline"[\s\S]*"entries"[\s\S]*\}/;
      const jsonMatch = html.match(jsonBlobPattern);
      if (jsonMatch) {
        match = [jsonMatch[0], jsonMatch[0]];
      }
    }

    if (!match || !match[1]) {
      console.error(`[free-rss] ${username}: No timeline data found (html length: ${html.length})`);
      return [];
    }

    let pageData: unknown;
    try {
      pageData = JSON.parse(match[1]);
    } catch {
      console.error(
        `[free-rss] ${username}: Failed to parse JSON (snippet: ${match[1].slice(0, 200)})`
      );
      return [];
    }

    const articles = extractArticlesFromPageData(pageData, username);

    console.log(`[free-rss] ${username}: fetched ${articles.length} tweets`);
    return articles;
  } catch (err) {
    console.error(`[free-rss] ${username}: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

// ─── Main export ─────────────────────────────────────────────────────

export async function fetchFreshArticlesFromRss(
  limit: number = 200,
  maxAgeDays: number = RECENT_ARTICLE_WINDOW_DAYS
): Promise<Article[]> {
  const results = await Promise.allSettled(
    ARTICLE_AUTHORS.map(username => fetchAuthorTimeline(username))
  );

  const freshArticles = new Map<string, Article>();
  let totalFetched = 0;

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;

    for (const article of result.value) {
      totalFetched++;
      if (!freshArticles.has(article.url)) {
        freshArticles.set(article.url, article);
      }
    }
  }

  console.log(`[free-rss] Total fetched: ${totalFetched}, unique: ${freshArticles.size}`);

  // Update cache with fresh articles (merge, don't replace)
  if (freshArticles.size > 0) {
    Array.from(freshArticles.entries()).forEach(([url, article]) => {
      articleCache.articles.set(url, article);
    });
    articleCache.lastSuccessfulFetch = Date.now();
  }

  // Prune stale articles from cache
  const cacheAgeLimit = Date.now() - CACHE_MAX_AGE_MS;
  Array.from(articleCache.articles.entries()).forEach(([url, article]) => {
    const articleDate = new Date(article.first_seen_at).getTime();
    if (articleDate < cacheAgeLimit) {
      articleCache.articles.delete(url);
    }
  });

  // Use cache as the source (it contains both fresh + previously cached articles)
  const allArticles =
    articleCache.articles.size > 0
      ? Array.from(articleCache.articles.values())
      : Array.from(freshArticles.values());

  console.log(
    `[free-rss] Cache size: ${articleCache.articles.size}, serving: ${allArticles.length}`
  );

  return allArticles
    .filter(a => isArticleRecent(a, maxAgeDays))
    .sort((a, b) => {
      const scoreA = a.likes + a.retweets * 2;
      const scoreB = b.likes + b.retweets * 2;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime();
    })
    .slice(0, limit);
}
