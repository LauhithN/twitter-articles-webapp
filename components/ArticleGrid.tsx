// Interactive grid with sidebar view filtering

'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Article } from '@/lib/types';
import {
  parseSidebarView,
  sortArticlesForView,
  summarizeAnalytics,
  type SidebarView,
} from '@/lib/article-views';
import { useBookmarks } from '@/lib/hooks/useLocalStorage';
import { formatNumber } from '@/lib/utils';
import { ArticleCard } from './ArticleCard';
import { FireIcon, TrendingUpIcon, BookmarkIcon, ChartIcon } from './Icons';

interface ArticleGridProps {
  articles: Article[];
}

function getViewLabel(view: SidebarView): string {
  if (view === 'rising') return 'Rising';
  if (view === 'saved') return 'Saved';
  if (view === 'analytics') return 'Analytics';
  return 'Trending';
}

function getViewDescription(view: SidebarView, totalCount: number): string {
  if (view === 'rising') return `Ranked by engagement velocity across ${totalCount} live records.`;
  if (view === 'saved') return 'Articles you bookmarked locally on this browser.';
  if (view === 'analytics') return `Snapshot metrics from ${totalCount} live records.`;
  return `Ranked by weighted engagement across ${totalCount} live records.`;
}

function getViewIcon(view: SidebarView) {
  if (view === 'rising') return TrendingUpIcon;
  if (view === 'saved') return BookmarkIcon;
  if (view === 'analytics') return ChartIcon;
  return FireIcon;
}

function EmptyState({ view }: { view: SidebarView }) {
  if (view === 'saved') {
    return (
      <div className="rounded-2xl glass-highlight p-12 text-center">
        <p className="text-white/80">No saved articles yet</p>
        <p className="mt-2 text-sm text-white/50">
          Use the bookmark icon on any article card, then open this tab again.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-highlight p-12 text-center">
      <p className="text-white/60">No articles found</p>
      <p className="mt-2 text-sm text-white/40">Check back later</p>
    </div>
  );
}

function AnalyticsPanel({ articles }: { articles: Article[] }) {
  const summary = useMemo(() => summarizeAnalytics(articles), [articles]);
  const metrics = [
    { label: 'Articles', value: formatNumber(summary.totalArticles) },
    { label: 'Likes', value: formatNumber(summary.totalLikes) },
    { label: 'Retweets', value: formatNumber(summary.totalRetweets) },
    { label: 'Impressions', value: formatNumber(summary.totalImpressions) },
    { label: 'Bookmarks', value: formatNumber(summary.totalBookmarks) },
    { label: 'Shares', value: formatNumber(summary.totalShares) },
  ];

  return (
    <section className="mb-6 rounded-2xl glass-highlight p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-white/85">Live analytics</h3>
        <span className="text-sm text-white/50">Top author: {summary.topAuthor}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {metrics.map(metric => (
          <div key={metric.label} className="rounded-xl glass p-3">
            <div className="text-xs uppercase tracking-wide text-white/45">{metric.label}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-white/90">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  const searchParams = useSearchParams();
  const currentView = parseSidebarView(searchParams.get('view'));
  const { bookmarks } = useBookmarks();

  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);
  const visibleArticles = useMemo(
    () => sortArticlesForView(articles, currentView, bookmarkSet),
    [articles, currentView, bookmarkSet]
  );

  const viewLabel = getViewLabel(currentView);
  const ViewIcon = getViewIcon(currentView);

  return (
    <section>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white/90">
            <ViewIcon className="h-5 w-5 text-white/80" />
            {viewLabel} Articles
          </h2>
          <p className="mt-1 text-sm text-white/50">
            {getViewDescription(currentView, articles.length)}
          </p>
        </div>
        <span className="rounded-lg glass px-3 py-1.5 text-sm text-white/70">
          {visibleArticles.length} results
        </span>
      </header>

      {currentView === 'analytics' && <AnalyticsPanel articles={articles} />}

      {visibleArticles.length === 0 ? (
        <EmptyState view={currentView} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
