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
      <div className="flex justify-between items-start mb-3">
        <span className="text-meta text-muted">{article.domain}</span>
        <span className="font-mono text-meta bg-black text-white px-2 py-0.5">
          {formatNumber(article.tweet_count)} tweets
        </span>
      </div>

      <h2 className="text-title text-foreground mb-2 leading-tight">
        {article.title}
      </h2>

      {article.description && (
        <p className="text-body text-muted mb-3 line-clamp-2">
          {article.description}
        </p>
      )}

      <div className="text-meta text-muted">
        Updated {formatTimeAgo(article.last_updated_at)}
      </div>
    </a>
  )
}
