import { Header } from '@/components/Header'
import { ArticleGrid } from '@/components/ArticleGrid'
import { getArticles, getLastUpdatedTime } from '@/lib/supabase'
import { Article } from '@/lib/types'

export const revalidate = 300 // ISR: revalidate every 5 minutes

// Demo data for development without Supabase
const DEMO_ARTICLES: Article[] = [
  {
    id: '1',
    url: 'https://example.com/article-1',
    title: 'How to Build Fast Web Applications in 2025',
    domain: 'example.com',
    tweet_count: 1234,
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 3600000).toISOString(),
    preview_image: null,
    description: 'A comprehensive guide to building performant web applications using modern techniques and best practices.',
  },
  {
    id: '2',
    url: 'https://techblog.io/startup-lessons',
    title: 'Lessons Learned from Scaling to 1 Million Users',
    domain: 'techblog.io',
    tweet_count: 892,
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 7200000).toISOString(),
    preview_image: null,
    description: 'Real-world experiences and insights from scaling infrastructure.',
  },
  {
    id: '3',
    url: 'https://news.dev/typescript-tips',
    title: 'Advanced TypeScript Patterns You Should Know',
    domain: 'news.dev',
    tweet_count: 567,
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 10800000).toISOString(),
    preview_image: null,
    description: 'Master these TypeScript patterns to write better, more maintainable code.',
  },
  {
    id: '4',
    url: 'https://blog.opensource.org/ai-tools',
    title: 'The Best Open Source AI Tools of 2025',
    domain: 'opensource.org',
    tweet_count: 445,
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 14400000).toISOString(),
    preview_image: null,
    description: 'A curated list of the most useful open source AI tools available today.',
  },
  {
    id: '5',
    url: 'https://engineering.company.com/database',
    title: 'Why We Switched from PostgreSQL to SQLite',
    domain: 'engineering.company.com',
    tweet_count: 334,
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 18000000).toISOString(),
    preview_image: null,
    description: 'Our journey migrating from a complex database setup to simple SQLite files.',
  },
  {
    id: '6',
    url: 'https://css-weekly.com/modern-css',
    title: 'Modern CSS Features You Might Not Know About',
    domain: 'css-weekly.com',
    tweet_count: 289,
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 21600000).toISOString(),
    preview_image: null,
    description: 'Discover powerful CSS features that have shipped in browsers recently.',
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
