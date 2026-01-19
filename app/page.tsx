import { Header } from '@/components/Header'
import { ArticleGrid } from '@/components/ArticleGrid'
import { getArticles, getLastUpdatedTime } from '@/lib/supabase'
import { Article } from '@/lib/types'

export const revalidate = 300 // ISR: revalidate every 5 minutes

// Demo data for development without Supabase - 10 viral tweets
const DEMO_ARTICLES: Article[] = [
  {
    id: '1',
    url: 'https://x.com/elonmusk/status/1879234567890',
    title: 'Then it is war.',
    domain: 'x.com',
    tweet_count: 48293,
    likes: 1847293,
    retweets: 284729,
    impressions: 89400000,
    bookmarks: 127834,
    shares: 94827,
    author_name: 'Elon Musk',
    author_username: 'elonmusk',
    author_url: 'https://x.com/elonmusk',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 3600000).toISOString(),
    preview_image: null,
    description: 'Elon Musk\'s dramatic response that went viral across all platforms, sparking massive debate and engagement.',
  },
  {
    id: '2',
    url: 'https://x.com/sama/status/1879123456789',
    title: 'No thank you, but we will buy Twitter for $9.74 billion if you want.',
    domain: 'x.com',
    tweet_count: 32847,
    likes: 923847,
    retweets: 187234,
    impressions: 45200000,
    bookmarks: 89234,
    shares: 67123,
    author_name: 'Sam Altman',
    author_username: 'sama',
    author_url: 'https://x.com/sama',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 7200000).toISOString(),
    preview_image: null,
    description: 'Sam Altman\'s savage response to Elon Musk\'s OpenAI bid, referencing Twitter\'s declining valuation.',
  },
  {
    id: '3',
    url: 'https://x.com/OpenAI/status/1879567890123',
    title: 'Introducing GPT-5. Our most capable model yet.',
    domain: 'x.com',
    tweet_count: 67234,
    likes: 789234,
    retweets: 234567,
    impressions: 67800000,
    bookmarks: 234567,
    shares: 123456,
    author_name: 'OpenAI',
    author_username: 'OpenAI',
    author_url: 'https://x.com/OpenAI',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 10800000).toISOString(),
    preview_image: null,
    description: 'The official announcement of GPT-5 broke the internet with millions of developers rushing to try it.',
  },
  {
    id: '4',
    url: 'https://x.com/levelsio/status/1879345678901',
    title: 'I just hit $3M ARR with mass-layoff.fyi. All bootstrapped. No VC. No employees. Just vibes.',
    domain: 'x.com',
    tweet_count: 28934,
    likes: 567823,
    retweets: 98234,
    impressions: 23400000,
    bookmarks: 78234,
    shares: 45123,
    author_name: 'Pieter Levels',
    author_username: 'levelsio',
    author_url: 'https://x.com/levelsio',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 14400000).toISOString(),
    preview_image: null,
    description: 'The indie hacker legend shares another milestone, inspiring thousands of solo founders worldwide.',
  },
  {
    id: '5',
    url: 'https://x.com/karpathy/status/1879456789012',
    title: 'Let me explain how LLMs actually work, in simple terms. Thread',
    domain: 'x.com',
    tweet_count: 24567,
    likes: 445678,
    retweets: 89234,
    impressions: 18900000,
    bookmarks: 156234,
    shares: 34567,
    author_name: 'Andrej Karpathy',
    author_username: 'karpathy',
    author_url: 'https://x.com/karpathy',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 18000000).toISOString(),
    preview_image: null,
    description: 'Former Tesla AI director breaks down large language models in an accessible 20-tweet thread that went viral.',
  },
  {
    id: '6',
    url: 'https://x.com/AnthropicAI/status/1879890123456',
    title: 'Claude can now use computers. Introducing computer use in public beta.',
    domain: 'x.com',
    tweet_count: 34567,
    likes: 345678,
    retweets: 78234,
    impressions: 28900000,
    bookmarks: 89234,
    shares: 45678,
    author_name: 'Anthropic',
    author_username: 'AnthropicAI',
    author_url: 'https://x.com/AnthropicAI',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 21600000).toISOString(),
    preview_image: null,
    description: 'Anthropic shocks the AI world with Claude\'s new ability to control desktop applications autonomously.',
  },
  {
    id: '7',
    url: 'https://x.com/dhh/status/1879901234567',
    title: 'We left the cloud. Saved $2M/year. No regrets. Here\'s exactly how we did it.',
    domain: 'x.com',
    tweet_count: 21234,
    likes: 287234,
    retweets: 56789,
    impressions: 15600000,
    bookmarks: 78234,
    shares: 34567,
    author_name: 'DHH',
    author_username: 'dhh',
    author_url: 'https://x.com/dhh',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 25200000).toISOString(),
    preview_image: null,
    description: 'Basecamp CTO\'s detailed breakdown of leaving AWS goes viral, reigniting the cloud vs on-prem debate.',
  },
  {
    id: '8',
    url: 'https://x.com/fireship_dev/status/1879012345678',
    title: 'JavaScript mass-devastation in 100 seconds: Bun just mass deleted Node.js. Here\'s why.',
    domain: 'x.com',
    tweet_count: 19234,
    likes: 256789,
    retweets: 45678,
    impressions: 13400000,
    bookmarks: 56234,
    shares: 28934,
    author_name: 'Fireship',
    author_username: 'fireship_dev',
    author_url: 'https://x.com/fireship_dev',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 28800000).toISOString(),
    preview_image: null,
    description: 'The legendary tech educator explains the JavaScript runtime wars in his signature rapid-fire style.',
  },
  {
    id: '9',
    url: 'https://x.com/rauchg/status/1879678901234',
    title: 'Next.js 15.1 is out. Zero-config edge deployments. 10x faster builds. This changes everything.',
    domain: 'x.com',
    tweet_count: 18923,
    likes: 234567,
    retweets: 45678,
    impressions: 12300000,
    bookmarks: 67234,
    shares: 23456,
    author_name: 'Guillermo Rauch',
    author_username: 'rauchg',
    author_url: 'https://x.com/rauchg',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 32400000).toISOString(),
    preview_image: null,
    description: 'Vercel CEO announces major Next.js update with groundbreaking performance improvements.',
  },
  {
    id: '10',
    url: 'https://x.com/t3dotgg/status/1879789012345',
    title: 'Hot take: The best developers I know delete more code than they write. Shipping fast means knowing what NOT to build.',
    domain: 'x.com',
    tweet_count: 15678,
    likes: 198234,
    retweets: 34567,
    impressions: 9800000,
    bookmarks: 45678,
    shares: 19234,
    author_name: 'Theo',
    author_username: 't3dotgg',
    author_url: 'https://x.com/t3dotgg',
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 36000000).toISOString(),
    preview_image: null,
    description: 'Popular tech YouTuber\'s controversial opinion sparks heated debate in the developer community.',
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
