// Simple grid for glass cards - Server Component

import { Article } from '@/lib/types';
import { ArticleCard } from './ArticleCard';

interface ArticleGridProps {
  articles: Article[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="glass-highlight rounded-2xl p-12 text-center">
        <p className="text-white/60">No articles found</p>
        <p className="text-sm text-white/40 mt-2">Check back later</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
