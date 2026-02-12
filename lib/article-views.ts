import type { Article } from './types';
import { getTotalEngagement, getWeightedEngagement } from './engagement';

export type SidebarView = 'trending' | 'rising' | 'saved' | 'analytics';

export const DEFAULT_SIDEBAR_VIEW: SidebarView = 'trending';

const VALID_VIEWS: SidebarView[] = ['trending', 'rising', 'saved', 'analytics'];

export interface AnalyticsSummary {
  totalArticles: number;
  totalEngagements: number;
  totalLikes: number;
  totalRetweets: number;
  totalReplies: number;
  totalImpressions: number;
  totalBookmarks: number;
  totalShares: number;
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
  return getWeightedEngagement(article);
}

export function getTrendingScore(article: Article): number {
  return getRawEngagement(article);
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
      acc.totalEngagements += getTotalEngagement(article);
      acc.totalLikes += article.likes;
      acc.totalRetweets += article.retweets;
      acc.totalReplies += article.replies;
      acc.totalImpressions += article.impressions;
      acc.totalBookmarks += article.bookmarks;
      acc.totalShares += article.shares;
      return acc;
    },
    {
      totalEngagements: 0,
      totalLikes: 0,
      totalRetweets: 0,
      totalReplies: 0,
      totalImpressions: 0,
      totalBookmarks: 0,
      totalShares: 0,
    }
  );

  return {
    totalArticles: articles.length,
    totalEngagements: totals.totalEngagements,
    totalLikes: totals.totalLikes,
    totalRetweets: totals.totalRetweets,
    totalReplies: totals.totalReplies,
    totalImpressions: totals.totalImpressions,
    totalBookmarks: totals.totalBookmarks,
    totalShares: totals.totalShares,
  };
}
