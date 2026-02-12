// Hero treatment for #1 article - Server Component

import { Article } from '@/lib/types';
import { isTwitterDomain } from '@/lib/article-source';
import { AuthorAvatar } from './AuthorAvatar';
import { ViralityBadge } from './ViralityBadge';
import { MetricLarge } from './MetricPill';
import { ExternalLinkIcon } from './Icons';

interface HeroArticleCardProps {
  article: Article;
  rank?: number;
}

export function HeroArticleCard({ article, rank = 1 }: HeroArticleCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group relative block overflow-hidden
        bg-gradient-to-br from-surface-2 to-surface-1
        border border-border-emphasis
        p-6 md:p-8
        transition-all duration-200
        hover:border-accent/50
        hover:shadow-glow-accent
        animate-card-enter stagger-1
      "
    >
      {/* Rank badge - corner treatment */}
      <div className="absolute top-0 left-0">
        <div
          className="
          relative
          w-20 h-20
          bg-gradient-to-br from-viral-explosive to-viral-hot
          flex items-center justify-center
          [clip-path:polygon(0_0,100%_0,0_100%)]
        "
        >
          <span className="absolute top-3 left-3 font-mono text-display text-white font-bold">
            #{rank}
          </span>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div
        className="
        absolute inset-0 opacity-0 group-hover:opacity-100
        bg-gradient-to-r from-viral-explosive/5 via-transparent to-viral-hot/5
        transition-opacity duration-300
        pointer-events-none
      "
      />

      {/* Content */}
      <div className="relative pl-16 md:pl-20">
        {/* Top row: Badge + Author */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <ViralityBadge impressions={article.impressions} />

          <div className="flex items-center gap-3">
            <AuthorAvatar name={article.author_name} username={article.author_username} size="lg" />
            <div>
              <div className="text-body font-semibold text-text-primary">{article.author_name}</div>
              <div className="text-meta text-text-muted">@{article.author_username}</div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-headline md:text-display text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-3">
          {article.title}
        </h2>

        {/* Domain tag */}
        {article.domain && !isTwitterDomain(article.domain) && (
          <div className="mb-6">
            <span
              className="
              inline-block px-3 py-1
              bg-surface-2 border border-border-subtle
              text-label text-text-muted uppercase tracking-wider
              font-mono
            "
            >
              {article.domain}
            </span>
          </div>
        )}

        {/* Metrics - large display */}
        <div className="mt-6 pt-6 border-t border-border-subtle">
          <MetricLarge
            likes={article.likes}
            retweets={article.retweets}
            replies={article.replies}
          />
        </div>

        {/* Read indicator */}
        <div
          className="
          flex items-center gap-2 mt-6
          text-text-muted text-meta
          opacity-0 group-hover:opacity-100
          transform translate-x-0 group-hover:translate-x-2
          transition-all duration-200
        "
        >
          <span>Read on X</span>
          <ExternalLinkIcon className="w-4 h-4" />
        </div>
      </div>
    </a>
  );
}
