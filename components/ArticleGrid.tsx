import { Article } from '@/lib/types'
import { ArticleCard } from './ArticleCard'

interface ArticleGridProps {
  articles: Article[]
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="border-2 border-black p-8 text-center">
        <p className="text-body text-muted">No articles found.</p>
        <p className="text-meta text-muted mt-2">
          Check back later or configure your Supabase connection.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
