import type { Article } from './types';

export type SidebarView = 'trending' | 'rising' | 'saved' | 'analytics';

export const DEFAULT_SIDEBAR_VIEW: SidebarView = 'trending';

const VALID_VIEWS: SidebarView[] = ['trending', 'rising', 'saved', 'analytics'];

export interface AnalyticsSummary {
  totalArticles: number;
  totalLikes: number;
  totalRetweets: number;
  totalImpressions: number;
  totalBookmarks: number;
  totalShares: number;
  topAuthor: string;
}

export function parseSidebarView(view: string | null | undefined): SidebarView {
  if (!view) return DEFAULT_SIDEBAR_VIEW;
  if (VALID_VIEWS.includes(view as SidebarView)) {
    return view as SidebarView;
  }
  return DEFAULT_SIDEBAR_VIEW;
}

export function getArticleBookmarkKeys(article: Article): string[] {
  const keys = [article.url, article.id].filter((value): value is string => Boolean(value));
  return Array.from(new Set(keys));
}

function toSafeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function getAgeHours(article: Article): number {
  const now = Date.now();
  const firstSeen = toSafeDate(article.first_seen_at);
  const lastUpdated = toSafeDate(article.last_updated_at);
  const baseline = firstSeen?.getTime() ?? lastUpdated?.getTime() ?? now;
  const diffMs = Math.max(0, now - baseline);
  return diffMs / 3_600_000;
}

function getRawEngagement(article: Article): number {
  return (
    article.likes * 1 +
    article.retweets * 2 +
    article.bookmarks * 3 +
    article.shares * 3 +
    article.tweet_count * 20 +
    article.impressions / 1_000
  );
}

export function getTrendingScore(article: Article): number {
  const recencyBoost = Math.max(0, 72 - getAgeHours(article)) * 5;
  return getRawEngagement(article) + recencyBoost;
}

export function getRisingScore(article: Article): number {
  const denominator = Math.max(2, getAgeHours(article)) ** 0.85;
  return getRawEngagement(article) / denominator;
}

export function sortArticlesForView(
  articles: Article[],
  view: SidebarView,
  bookmarkIds: Set<string>
): Article[] {
  if (articles.length === 0) return [];

  const copy = [...articles];

  if (view === 'saved') {
    return copy.filter(article =>
      getArticleBookmarkKeys(article).some(key => bookmarkIds.has(key))
    );
  }

  if (view === 'rising') {
    return copy.sort((left, right) => getRisingScore(right) - getRisingScore(left));
  }

  if (view === 'analytics') {
    return copy.sort((left, right) => {
      if (right.impressions !== left.impressions) return right.impressions - left.impressions;
      return getTrendingScore(right) - getTrendingScore(left);
    });
  }

  return copy.sort((left, right) => getTrendingScore(right) - getTrendingScore(left));
}

export function summarizeAnalytics(articles: Article[]): AnalyticsSummary {
  const totals = articles.reduce(
    (acc, article) => {
      acc.totalLikes += article.likes;
      acc.totalRetweets += article.retweets;
      acc.totalImpressions += article.impressions;
      acc.totalBookmarks += article.bookmarks;
      acc.totalShares += article.shares;
      const author = article.author_name || article.author_username || 'Unknown';
      const authorEngagement =
        article.likes + article.retweets * 2 + article.bookmarks * 3 + article.shares * 3;
      acc.authorScores.set(author, (acc.authorScores.get(author) || 0) + authorEngagement);
      return acc;
    },
    {
      totalLikes: 0,
      totalRetweets: 0,
      totalImpressions: 0,
      totalBookmarks: 0,
      totalShares: 0,
      authorScores: new Map<string, number>(),
    }
  );

  let topAuthor = 'N/A';
  let bestScore = -1;

  totals.authorScores.forEach((score, author) => {
    if (score > bestScore) {
      bestScore = score;
      topAuthor = author;
    }
  });

  return {
    totalArticles: articles.length,
    totalLikes: totals.totalLikes,
    totalRetweets: totals.totalRetweets,
    totalImpressions: totals.totalImpressions,
    totalBookmarks: totals.totalBookmarks,
    totalShares: totals.totalShares,
    topAuthor,
  };
}
