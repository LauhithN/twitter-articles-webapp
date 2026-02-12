import { Header } from '@/components/Header';
import { WaitlistCTA } from '@/components/WaitlistCTA';
import { ArticleGrid } from '@/components/ArticleGrid';
import type { Article } from '@/lib/types';
import { fetchFreshArticlesFromRss } from '@/lib/free-rss';
import { getArticles, getLastUpdatedTime, isTimestampStale } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STALE_AFTER_HOURS = 2;

async function loadArticles(): Promise<{ articles: Article[]; lastUpdated: string | null }> {
  let articles: Article[] = [];
  let lastUpdated: string | null = null;

  try {
    articles = await getArticles(50);
    lastUpdated = await getLastUpdatedTime();
  } catch (error) {
    console.error('Failed to fetch articles from Supabase:', error);
  }

  const shouldFetchLive = articles.length === 0 || isTimestampStale(lastUpdated, STALE_AFTER_HOURS);

  if (shouldFetchLive) {
    try {
      const liveArticles = await fetchFreshArticlesFromRss(50);
      if (liveArticles.length > 0) {
        articles = liveArticles;
        lastUpdated = new Date().toISOString();
      }
    } catch (error) {
      console.error('Failed to fetch live RSS articles:', error);
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
