import { Article } from '@/lib/types'
import { formatTimeAgo, formatNumber } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-2 border-black p-4 hover:bg-hover-bg transition-colors duration-150"
    >
      {/* Author Section */}
      {article.author_name && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-mono text-sm">
            {article.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{article.author_name}</div>
            <a
              href={article.author_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-meta text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              @{article.author_username}
            </a>
          </div>
        </div>
      )}

      {/* Title */}
      <h2 className="text-title text-foreground mb-2 leading-tight">
        {article.title}
      </h2>

      {/* Description */}
      {article.description && (
        <p className="text-body text-muted mb-4 line-clamp-2">
          {article.description}
        </p>
      )}

      {/* Engagement Metrics */}
      <div className="grid grid-cols-5 gap-2 mb-3 py-3 border-t-2 border-b-2 border-black">
        <div className="text-center">
          <div className="font-mono text-sm font-bold text-foreground">{formatNumber(article.likes)}</div>
          <div className="text-xs text-muted">Likes</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-sm font-bold text-foreground">{formatNumber(article.retweets)}</div>
          <div className="text-xs text-muted">Retweets</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-sm font-bold text-foreground">{formatNumber(article.impressions)}</div>
          <div className="text-xs text-muted">Views</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-sm font-bold text-foreground">{formatNumber(article.bookmarks)}</div>
          <div className="text-xs text-muted">Bookmarks</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-sm font-bold text-foreground">{formatNumber(article.shares)}</div>
          <div className="text-xs text-muted">Shares</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-meta text-muted">
        <span>Updated {formatTimeAgo(article.last_updated_at)}</span>
        <span className="font-mono bg-accent text-black px-2 py-0.5">
          {formatNumber(article.tweet_count)} quotes
        </span>
      </div>
    </a>
  )
}
