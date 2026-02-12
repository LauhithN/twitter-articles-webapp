import type { Article } from './types';

const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.1d4.us',
];

const ARTICLE_AUTHORS = [
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

interface RssItem {
  title: string;
  link: string;
  description: string;
  creator: string | null;
  pubDate: string | null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  const safeTag = escapeRegex(tagName);
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

  for (const match of xml.matchAll(itemPattern)) {
    const block = match[1];
    if (!block) continue;

    const title = extractTagValue(block, 'title') ?? '';
    const link = extractTagValue(block, 'link') ?? '';
    const description = extractTagValue(block, 'description') ?? '';
    const creator =
      extractTagValue(block, 'dc:creator') ?? extractTagValue(block, 'creator') ?? null;
    const pubDate = extractTagValue(block, 'pubDate');

    if (!link) continue;

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

function normalizeStatusUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;

  const normalized = rawUrl
    .replace(/https?:\/\/nitter\.[^/]+/i, 'https://x.com')
    .replace(/https?:\/\/twitter\.com/i, 'https://x.com')
    .trim();

  if (!/\/status\/\d+/i.test(normalized)) {
    return null;
  }

  try {
    const parsed = new URL(normalized);
    return parsed.toString();
  } catch {
    return null;
  }
}

function buildArticleFromRssItem(item: RssItem, authorUsername: string): Article | null {
  const statusUrl = normalizeStatusUrl(item.link);
  if (!statusUrl) return null;

  const contentText = stripHtml(item.description);
  const inferredTitle = item.title || contentText;
  if (!inferredTitle) return null;

  if (!item.pubDate) return null;
  const publishedAt = new Date(item.pubDate);
  if (Number.isNaN(publishedAt.getTime())) return null;

  const nowIso = new Date().toISOString();
  const statusIdMatch = statusUrl.match(/\/status\/(\d+)/);

  return {
    id: statusIdMatch?.[1] ?? statusUrl,
    url: statusUrl,
    title: truncate(inferredTitle, 220),
    domain: 'x.com',
    tweet_count: 1,
    likes: 0,
    retweets: 0,
    impressions: 0,
    bookmarks: 0,
    shares: 0,
    author_name: item.creator || authorUsername,
    author_username: authorUsername,
    author_url: `https://x.com/${authorUsername}`,
    first_seen_at: publishedAt.toISOString(),
    last_updated_at: nowIso,
    preview_image: null,
    description: contentText ? truncate(contentText, 500) : null,
  };
}

function isArticleRecent(article: Article, maxAgeDays: number): boolean {
  const publishedAt = new Date(article.first_seen_at);
  if (Number.isNaN(publishedAt.getTime())) return false;

  const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  return publishedAt.getTime() >= cutoffMs;
}

async function fetchFeedForAuthor(instance: string, authorUsername: string): Promise<Article[]> {
  const feedUrl = `${instance}/${authorUsername}/rss`;
  const response = await fetch(feedUrl, {
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ViralArticles/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Feed request failed (${response.status})`);
  }

  const xml = await response.text();
  if (!xml.includes('<item>')) {
    return [];
  }

  return parseRssItems(xml)
    .map(item => buildArticleFromRssItem(item, authorUsername))
    .filter((article): article is Article => article !== null);
}

async function getWorkingNitterInstance(): Promise<string> {
  const testAuthor = ARTICLE_AUTHORS[0];

  for (const instance of NITTER_INSTANCES) {
    try {
      const testUrl = `${instance}/${testAuthor}/rss`;
      const response = await fetch(testUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ViralArticles/1.0)' },
      });

      if (response.ok) {
        const payload = await response.text();
        if (payload.includes('<rss') || payload.includes('<item>')) {
          return instance;
        }
      }
    } catch {
      // Try next instance.
    }
  }

  return NITTER_INSTANCES[0];
}

export async function fetchFreshArticlesFromRss(
  limit: number = 50,
  maxAgeDays: number = RECENT_ARTICLE_WINDOW_DAYS
): Promise<Article[]> {
  const instance = await getWorkingNitterInstance();
  const feedResults = await Promise.allSettled(
    ARTICLE_AUTHORS.map(authorUsername => fetchFeedForAuthor(instance, authorUsername))
  );

  const deduped = new Map<string, Article>();

  for (const result of feedResults) {
    if (result.status !== 'fulfilled') continue;

    for (const article of result.value) {
      if (!deduped.has(article.url)) {
        deduped.set(article.url, article);
      }
    }
  }

  return Array.from(deduped.values())
    .filter(article => isArticleRecent(article, maxAgeDays))
    .sort(
      (left, right) =>
        new Date(right.first_seen_at).getTime() - new Date(left.first_seen_at).getTime()
    )
    .slice(0, limit);
}
