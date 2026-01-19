import { Header } from '@/components/Header'
import { ArticleGrid } from '@/components/ArticleGrid'
import { getArticles, getLastUpdatedTime } from '@/lib/supabase'
import { Article } from '@/lib/types'

export const revalidate = 300 // ISR: revalidate every 5 minutes

// Demo data - viral articles shared on X (last 7 days)
const DEMO_ARTICLES: Article[] = [
  {
    id: '1',
    url: 'https://x.com/thedankoe/status/1879234567890',
    title: 'The Art of Focus: Why Your Attention Is Your Most Valuable Asset',
    domain: 'thedankoe.com',
    tweet_count: 7400,
    likes: 273000,
    retweets: 52000,
    impressions: 163000000,
    bookmarks: 7400,
    shares: 12000,
    author_name: 'Dan Koe',
    author_username: 'thedankoe',
    author_url: 'https://x.com/thedankoe',
    first_seen_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_updated_at: new Date(Date.now() - 3600000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '2',
    url: 'https://x.com/naval/status/1879123456789',
    title: 'How to Get Rich: Every Episode',
    domain: 'nav.al',
    tweet_count: 45000,
    likes: 892000,
    retweets: 234000,
    impressions: 245000000,
    bookmarks: 156000,
    shares: 89000,
    author_name: 'Naval',
    author_username: 'naval',
    author_url: 'https://x.com/naval',
    first_seen_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_updated_at: new Date(Date.now() - 7200000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '3',
    url: 'https://x.com/paulg/status/1879567890123',
    title: 'How to Do Great Work',
    domain: 'paulgraham.com',
    tweet_count: 32000,
    likes: 567000,
    retweets: 123000,
    impressions: 89000000,
    bookmarks: 234000,
    shares: 67000,
    author_name: 'Paul Graham',
    author_username: 'paulg',
    author_url: 'https://x.com/paulg',
    first_seen_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    last_updated_at: new Date(Date.now() - 10800000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '4',
    url: 'https://x.com/levelsio/status/1879345678901',
    title: 'I\'m Launching 12 Startups in 12 Months',
    domain: 'levels.io',
    tweet_count: 28000,
    likes: 445000,
    retweets: 98000,
    impressions: 67000000,
    bookmarks: 189000,
    shares: 45000,
    author_name: 'Pieter Levels',
    author_username: 'levelsio',
    author_url: 'https://x.com/levelsio',
    first_seen_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    last_updated_at: new Date(Date.now() - 14400000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '5',
    url: 'https://x.com/karpathy/status/1879456789012',
    title: 'The Unreasonable Effectiveness of Recurrent Neural Networks',
    domain: 'karpathy.github.io',
    tweet_count: 24000,
    likes: 389000,
    retweets: 89000,
    impressions: 56000000,
    bookmarks: 267000,
    shares: 34000,
    author_name: 'Andrej Karpathy',
    author_username: 'karpathy',
    author_url: 'https://x.com/karpathy',
    first_seen_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_updated_at: new Date(Date.now() - 18000000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '6',
    url: 'https://x.com/alexhormozi/status/1879890123456',
    title: '$100M Offers: How To Make Offers So Good People Feel Stupid Saying No',
    domain: 'acquisition.com',
    tweet_count: 34000,
    likes: 512000,
    retweets: 145000,
    impressions: 123000000,
    bookmarks: 298000,
    shares: 78000,
    author_name: 'Alex Hormozi',
    author_username: 'alexhormozi',
    author_url: 'https://x.com/alexhormozi',
    first_seen_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    last_updated_at: new Date(Date.now() - 21600000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '7',
    url: 'https://x.com/SahilBloom/status/1879012345678',
    title: 'The 5 Types of Wealth',
    domain: 'sahilbloom.com',
    tweet_count: 19000,
    likes: 256000,
    retweets: 78000,
    impressions: 78000000,
    bookmarks: 145000,
    shares: 45000,
    author_name: 'Sahil Bloom',
    author_username: 'SahilBloom',
    author_url: 'https://x.com/SahilBloom',
    first_seen_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_updated_at: new Date(Date.now() - 28800000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '8',
    url: 'https://x.com/JamesClear/status/1879678901234',
    title: 'Atomic Habits: The Life-Changing Million Copy Bestseller',
    domain: 'jamesclear.com',
    tweet_count: 18000,
    likes: 378000,
    retweets: 89000,
    impressions: 92000000,
    bookmarks: 234000,
    shares: 56000,
    author_name: 'James Clear',
    author_username: 'JamesClear',
    author_url: 'https://x.com/JamesClear',
    first_seen_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    last_updated_at: new Date(Date.now() - 32400000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '9',
    url: 'https://x.com/waitbutwhy/status/1879789012345',
    title: 'The AI Revolution: The Road to Superintelligence',
    domain: 'waitbutwhy.com',
    tweet_count: 15000,
    likes: 234000,
    retweets: 67000,
    impressions: 56000000,
    bookmarks: 167000,
    shares: 34000,
    author_name: 'Tim Urban',
    author_username: 'waitbutwhy',
    author_url: 'https://x.com/waitbutwhy',
    first_seen_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    last_updated_at: new Date(Date.now() - 36000000).toISOString(),
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