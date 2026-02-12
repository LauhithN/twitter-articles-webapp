import { Header } from '@/components/Header';
import { WaitlistCTA } from '@/components/WaitlistCTA';
import { ArticleGrid } from '@/components/ArticleGrid';
import type { Article } from '@/lib/types';
import { fetchFreshArticlesFromRss } from '@/lib/free-rss';
import { getArticles, getLastUpdatedTime, isTimestampStale } from '@/lib/supabase';
import { isTwitterArticle } from '@/lib/article-source';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STALE_AFTER_HOURS = 2;

async function loadArticles(): Promise<{ articles: Article[]; lastUpdated: string | null }> {
  let articles: Article[] = [];
  let lastUpdated: string | null = null;

  // Try Supabase first
  try {
    articles = await getArticles(200);
    articles = articles.filter(isTwitterArticle);
    lastUpdated = await getLastUpdatedTime();
  } catch (error) {
    console.error('Failed to fetch articles from Supabase:', error);
  }

  // Always fetch live if DB is empty or stale
  const shouldFetchLive = articles.length === 0 || isTimestampStale(lastUpdated, STALE_AFTER_HOURS);

  if (shouldFetchLive) {
    try {
      const liveArticles = await fetchFreshArticlesFromRss(200);
      if (liveArticles.length > 0) {
        articles = liveArticles.filter(isTwitterArticle);
        lastUpdated = new Date().toISOString();
      }
    } catch (error) {
      console.error('Failed to fetch live RSS articles:', error);
    }
  }

  // Last resort: if still empty, try RSS one more time with longer window
  if (articles.length === 0) {
    try {
      const fallbackArticles = await fetchFreshArticlesFromRss(200, 30);
      if (fallbackArticles.length > 0) {
        articles = fallbackArticles.filter(isTwitterArticle);
        lastUpdated = new Date().toISOString();
      }
    } catch (error) {
      console.error('Fallback RSS fetch also failed:', error);
    }
  }

  return { articles, lastUpdated };
}

export default async function Home() {
  const { articles, lastUpdated } = await loadArticles();

  return (
    <>
      <Header lastUpdated={lastUpdated} />
      <WaitlistCTA />
      <ArticleGrid articles={articles} />
    </>
  );
}
