import { Header } from '@/components/Header'
import { ArticleGrid } from '@/components/ArticleGrid'
import { getArticles, getLastUpdatedTime } from '@/lib/supabase'
import { Article } from '@/lib/types'

export const revalidate = 300 // ISR: revalidate every 5 minutes

// Top viral X articles (last 7 days)
const DEMO_ARTICLES: Article[] = [
  {
    id: '1',
    url: 'https://x.com/thedankoe/status/2010751592346030461',
    title: 'How to fix your entire life in 1 day',
    domain: 'x.com',
    tweet_count: 7400,
    likes: 273000,
    retweets: 52000,
    impressions: 150000000,
    bookmarks: 98000,
    shares: 12000,
    author_name: 'Dan Koe',
    author_username: 'thedankoe',
    author_url: 'https://x.com/thedankoe',
    first_seen_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    last_updated_at: new Date(Date.now() - 3600000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '2',
    url: 'https://x.com/IterIntellectus/status/2012220254504530043',
    title: 'The Science of Longevity',
    domain: 'x.com',
    tweet_count: 3200,
    likes: 89000,
    retweets: 21000,
    impressions: 45000000,
    bookmarks: 34000,
    shares: 8000,
    author_name: 'vittorio',
    author_username: 'IterIntellectus',
    author_url: 'https://x.com/IterIntellectus',
    first_seen_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_updated_at: new Date(Date.now() - 7200000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '3',
    url: 'https://x.com/thedankoe/status/2011827303962329458',
    title: 'How to articulate yourself intelligently',
    domain: 'x.com',
    tweet_count: 4500,
    likes: 156000,
    retweets: 38000,
    impressions: 40000000,
    bookmarks: 67000,
    shares: 15000,
    author_name: 'Dan Koe',
    author_username: 'thedankoe',
    author_url: 'https://x.com/thedankoe',
    first_seen_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    last_updated_at: new Date(Date.now() - 10800000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '4',
    url: 'https://x.com/IterIntellectus/status/2009707510362472735',
    title: 'AI just solved biology\'s biggest limitation',
    domain: 'x.com',
    tweet_count: 2800,
    likes: 78000,
    retweets: 19000,
    impressions: 32000000,
    bookmarks: 28000,
    shares: 6000,
    author_name: 'vittorio',
    author_username: 'IterIntellectus',
    author_url: 'https://x.com/IterIntellectus',
    first_seen_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    last_updated_at: new Date(Date.now() - 14400000).toISOString(),
    preview_image: null,
    description: null,
  },
]

export default async function Home() {
  let articles: Article[] = []
  let lastUpdated: string | null = null

  // Try to fetch from Supabase, fall back to demo data
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
    try {
      articles = await getArticles(50)
      lastUpdated = await getLastUpdatedTime()

      // If no articles from Supabase, use demo data
      if (!articles || articles.length === 0) {
        articles = DEMO_ARTICLES
        lastUpdated = new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to fetch from Supabase:', error)
      articles = DEMO_ARTICLES
      lastUpdated = new Date().toISOString()
    }
  } else {
    // Use demo data when Supabase is not configured
    articles = DEMO_ARTICLES
    lastUpdated = new Date().toISOString()
  }

  return (
    <>
      <Header lastUpdated={lastUpdated} />
      <ArticleGrid articles={articles} />
    </>
  )
}
