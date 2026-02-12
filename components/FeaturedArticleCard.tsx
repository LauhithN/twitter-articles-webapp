// Featured treatment for #2-3 articles - Server Component

import { Article } from '@/lib/types';
import { isTwitterDomain } from '@/lib/article-source';
import { AuthorAvatar } from './AuthorAvatar';
import { ViralityBadge } from './ViralityBadge';
import { MetricRow } from './MetricPill';
import { ExternalLinkIcon } from './Icons';

interface FeaturedArticleCardProps {
  article: Article;
  rank: number;
  animationDelay?: number;
}

export function FeaturedArticleCard({
  article,
  rank,
  animationDelay = 0,
}: FeaturedArticleCardProps) {
  const staggerClass = `stagger-${Math.min(animationDelay + 1, 8)}`;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative flex flex-col overflow-hidden
        bg-surface-1
        border border-border-subtle hover:border-border-emphasis
        transition-all duration-200
        hover:translate-y-[-2px]
        hover:shadow-card-hover
        animate-card-enter ${staggerClass}
      `}
    >
      {/* Top section with rank and badge */}
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-3">
          <div
            className="
            w-10 h-10
            bg-surface-2 border border-border-default
            flex items-center justify-center
            font-mono text-title text-text-secondary
          "
          >
            #{rank}
          </div>
          <ViralityBadge impressions={article.impressions} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pt-3 space-y-3">
        {/* Author row */}
        <div className="flex items-center gap-3">
          <AuthorAvatar name={article.author_name} username={article.author_username} size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-body font-medium text-text-primary truncate">
              {article.author_name}
            </div>
            <div className="text-caption text-text-muted">@{article.author_username}</div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-title text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </h2>

        {/* Domain */}
        {article.domain && !isTwitterDomain(article.domain) && (
          <span
            className="
            inline-block px-2 py-0.5
            bg-surface-2 border border-border-subtle
            text-label text-text-muted uppercase tracking-wider
            font-mono
          "
          >
            {article.domain}
          </span>
        )}
      </div>

      {/* Metrics bar - bottom edge */}
      <div
        className="
        flex items-center justify-between
        px-4 py-3
        bg-surface-2
        border-t border-border-subtle
      "
      >
        <MetricRow
          likes={article.likes}
          retweets={article.retweets}
          replies={article.replies}
          size="md"
        />

        {/* Read indicator */}
        <div
          className="
          flex items-center gap-1
          text-text-muted text-caption
          opacity-0 group-hover:opacity-100
          transform translate-x-0 group-hover:translate-x-1
          transition-all duration-150
        "
        >
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
}
