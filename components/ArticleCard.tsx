// Minimal glass article card - Server Component

import { Article } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { HeartIcon, RetweetIcon, ChartIcon } from './Icons';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group relative block
        rounded-2xl
        glass-highlight
        p-5
        transition-glass
        hover:-translate-y-0.5
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
      "
    >
      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/70">
          {article.author_name?.charAt(0) || 'A'}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/60">{article.author_name}</span>
          <span className="text-white/40">·</span>
          <span className="text-white/40">@{article.author_username}</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg font-medium text-white/90 leading-snug mb-4 line-clamp-2">
        {article.title}
      </h2>

      {/* Domain badge */}
      {article.domain && article.domain !== 'x.com' && (
        <div className="mb-4">
          <span className="inline-block px-2.5 py-1 rounded-lg glass text-xs text-white/50">
            {article.domain}
          </span>
        </div>
      )}

      {/* Metrics */}
      <div className="flex items-center gap-5 text-sm">
        <div className="flex items-center gap-1.5">
          <HeartIcon className="w-4 h-4 text-white/40" />
          <span className="text-emerald-400 font-medium tabular-nums">
            {formatNumber(article.likes)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <RetweetIcon className="w-4 h-4 text-white/40" />
          <span className="text-sky-400 font-medium tabular-nums">
            {formatNumber(article.retweets)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ChartIcon className="w-4 h-4 text-white/40" />
          <span className="text-white/60 font-medium tabular-nums">
            {formatNumber(article.impressions)}
          </span>
        </div>
      </div>
    </a>
  );
}
