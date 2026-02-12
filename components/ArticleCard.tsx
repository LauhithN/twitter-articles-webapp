// Minimal glass article card

'use client';

import type { MouseEvent } from 'react';
import type { Article } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { useBookmarks } from '@/lib/hooks/useLocalStorage';
import { getArticleBookmarkKeys } from '@/lib/article-views';
import { HeartIcon, RetweetIcon, ChartIcon, BookmarkIcon, BookmarkFilledIcon } from './Icons';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarkKeys = getArticleBookmarkKeys(article);
  const primaryBookmarkKey = bookmarkKeys[0];
  const saved = bookmarkKeys.some(key => isBookmarked(key));

  function handleBookmark(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!primaryBookmarkKey) return;
    toggleBookmark(primaryBookmarkKey);
  }

  return (
    <article
      className="
        group relative
        rounded-2xl
        glass-highlight
        p-5
        transition-glass
        hover:-translate-y-0.5
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
      "
    >
      <button
        type="button"
        onClick={handleBookmark}
        className="
          absolute right-3 top-3 z-20
          flex h-8 w-8 items-center justify-center
          rounded-lg glass
          transition-glass
          hover:bg-white/10
        "
        aria-label={saved ? 'Remove from saved' : 'Save article'}
        title={saved ? 'Remove from saved' : 'Save article'}
      >
        {saved ? (
          <BookmarkFilledIcon className="w-4 h-4 text-emerald-300" />
        ) : (
          <BookmarkIcon className="w-4 h-4 text-white/60" />
        )}
      </button>

      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
        {/* Author */}
        <div className="mb-3 flex items-center gap-2 pr-10">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white/70">
            {article.author_name?.charAt(0) || 'A'}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/60">{article.author_name}</span>
            <span className="text-white/40">&middot;</span>
            <span className="text-white/40">@{article.author_username}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4 line-clamp-2 text-lg font-medium leading-snug text-white/90">
          {article.title}
        </h2>

        {/* Domain badge */}
        {article.domain && article.domain !== 'x.com' && (
          <div className="mb-4">
            <span className="inline-block rounded-lg glass px-2.5 py-1 text-xs text-white/50">
              {article.domain}
            </span>
          </div>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5">
            <HeartIcon className="h-4 w-4 text-white/40" />
            <span className="font-medium tabular-nums text-emerald-400">
              {formatNumber(article.likes)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <RetweetIcon className="h-4 w-4 text-white/40" />
            <span className="font-medium tabular-nums text-sky-400">
              {formatNumber(article.retweets)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChartIcon className="h-4 w-4 text-white/40" />
            <span className="font-medium tabular-nums text-white/60">
              {formatNumber(article.impressions)}
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}
