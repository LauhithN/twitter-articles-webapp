import { Header } from '@/components/Header';
import { ArticleGrid, SimpleArticleGrid } from '@/components/ArticleGrid';
import { getArticles, getLastUpdatedTime } from '@/lib/supabase';
import { Article } from '@/lib/types';

export const revalidate = 300; // ISR: revalidate every 5 minutes

// Top viral X articles (last 7 days) - Demo data
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
    title: "AI just solved biology's biggest limitation",
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
  {
    id: '9',
    url: 'https://x.com/naval/status/2013111111111111111',
    title: 'The art of wealth creation without selling your soul',
    domain: 'x.com',
    tweet_count: 5200,
    likes: 198000,
    retweets: 45000,
    impressions: 28000000,
    bookmarks: 72000,
    shares: 18000,
    author_name: 'Naval',
    author_username: 'naval',
    author_url: 'https://x.com/naval',
    first_seen_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_updated_at: new Date(Date.now() - 5400000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '10',
    url: 'https://x.com/SahilBloom/status/2013222222222222222',
    title: 'The 10 mental models that changed my life',
    domain: 'x.com',
    tweet_count: 4100,
    likes: 145000,
    retweets: 32000,
    impressions: 25000000,
    bookmarks: 58000,
    shares: 14000,
    author_name: 'Sahil Bloom',
    author_username: 'SahilBloom',
    author_url: 'https://x.com/SahilBloom',
    first_seen_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    last_updated_at: new Date(Date.now() - 3600000).toISOString(),
    preview_image: null,
    description: null,
  },
];

// Honourable mentions
const HONOURABLE_MENTIONS: Article[] = [
  {
    id: '5',
    url: 'https://x.com/milesdeutscher/status/2011867442105237683',
    title: 'Crypto Market Analysis',
    domain: 'x.com',
    tweet_count: 1800,
    likes: 45000,
    retweets: 12000,
    impressions: 18000000,
    bookmarks: 15000,
    shares: 4000,
    author_name: 'Miles Deutscher',
    author_username: 'milesdeutscher',
    author_url: 'https://x.com/milesdeutscher',
    first_seen_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_updated_at: new Date(Date.now() - 5400000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '6',
    url: 'https://x.com/thedankoe/status/2012956603297964167',
    title: 'The Future of Content Creation',
    domain: 'x.com',
    tweet_count: 2100,
    likes: 52000,
    retweets: 14000,
    impressions: 22000000,
    bookmarks: 18000,
    shares: 5000,
    author_name: 'Dan Koe',
    author_username: 'thedankoe',
    author_url: 'https://x.com/thedankoe',
    first_seen_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    last_updated_at: new Date(Date.now() - 3600000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '7',
    url: 'https://x.com/noironsol/status/2013078582608966104',
    title: 'Building in Public',
    domain: 'x.com',
    tweet_count: 1500,
    likes: 38000,
    retweets: 9000,
    impressions: 15000000,
    bookmarks: 12000,
    shares: 3500,
    author_name: 'noironsol',
    author_username: 'noironsol',
    author_url: 'https://x.com/noironsol',
    first_seen_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    last_updated_at: new Date(Date.now() - 7200000).toISOString(),
    preview_image: null,
    description: null,
  },
  {
    id: '8',
    url: 'https://x.com/XCreators/status/2011957172821737574',
    title: 'X Creator Program Announcement',
    domain: 'x.com',
    tweet_count: 3500,
    likes: 67000,
    retweets: 18000,
    impressions: 28000000,
    bookmarks: 22000,
    shares: 8000,
    author_name: 'X Creators',
    author_username: 'XCreators',
    author_url: 'https://x.com/XCreators',
    first_seen_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_updated_at: new Date(Date.now() - 10800000).toISOString(),
    preview_image: null,
    description: null,
  },
];

export default async function Home() {
  let articles: Article[] = [];
  let lastUpdated: string | null = null;

  // Try to fetch from Supabase, fall back to demo data
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
    try {
      articles = await getArticles(50);
      lastUpdated = await getLastUpdatedTime();

      // If no articles from Supabase, use demo data
      if (!articles || articles.length === 0) {
        articles = DEMO_ARTICLES;
        lastUpdated = new Date().toISOString();
      }
    } catch (error) {
      console.error('Failed to fetch from Supabase:', error);
      articles = DEMO_ARTICLES;
      lastUpdated = new Date().toISOString();
    }
  } else {
    // Use demo data when Supabase is not configured
    articles = DEMO_ARTICLES;
    lastUpdated = new Date().toISOString();
  }

  return (
    <>
      <Header lastUpdated={lastUpdated} />
      <ArticleGrid articles={articles} showHero={true} />

      {/* Honourable Mentions Section */}
      <section className="mt-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border-subtle" />
          <h2 className="text-headline font-bold text-text-primary uppercase tracking-wider">
            Honourable Mentions
          </h2>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>
        <SimpleArticleGrid articles={HONOURABLE_MENTIONS} />
      </section>
    </>
  );
}
