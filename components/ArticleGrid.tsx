// Hierarchical article grid - Server Component

import { Article } from '@/lib/types';
import { HeroArticleCard } from './HeroArticleCard';
import { FeaturedArticleCard } from './FeaturedArticleCard';
import { ArticleCard } from './ArticleCard';

interface ArticleGridProps {
  articles: Article[];
  showHero?: boolean;
}

export function ArticleGrid({ articles, showHero = true }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="border border-border-subtle bg-surface-1 p-8 text-center">
        <p className="text-body text-text-secondary">No articles found.</p>
        <p className="text-meta text-text-muted mt-2">
          Check back later or configure your Supabase connection.
        </p>
      </div>
    );
  }

  // If not showing hero treatment, just render a simple grid
  if (!showHero) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article, index) => (
          <ArticleCard key={article.id} article={article} rank={index + 1} animationDelay={index} />
        ))}
      </div>
    );
  }

  // Hierarchical layout: Hero (#1) → Featured (#2-3) → Standard (#4+)
  const [hero, ...rest] = articles;
  const featured = rest.slice(0, 2);
  const standard = rest.slice(2);

  return (
    <div className="space-y-6">
      {/* #1 - Full-width hero card */}
      {hero && <HeroArticleCard article={hero} rank={1} />}

      {/* #2-3 - Featured side-by-side */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featured.map((article, index) => (
            <FeaturedArticleCard
              key={article.id}
              article={article}
              rank={index + 2}
              animationDelay={index + 1}
            />
          ))}
        </div>
      )}

      {/* #4+ - Dense 3-column grid */}
      {standard.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {standard.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              rank={index + 4}
              animationDelay={index + 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Simple grid for sections like Honourable Mentions
export function SimpleArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {articles.map((article, index) => (
        <ArticleCard key={article.id} article={article} animationDelay={index} />
      ))}
    </div>
  );
}
