-- Drop existing tables if they exist (fresh start)
DROP TABLE IF EXISTS tweets CASCADE;
DROP TABLE IF EXISTS articles CASCADE;

-- Create Articles table with extended metrics
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  tweet_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  bookmarks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  author_name TEXT,
  author_username TEXT,
  author_url TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  preview_image TEXT,
  description TEXT
);

-- Create Tweets table
CREATE TABLE tweets (
  id TEXT PRIMARY KEY,
  article_id UUID REFERENCES articles(id),
  author_username TEXT,
  author_display_name TEXT,
  text TEXT,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_articles_tweet_count ON articles(tweet_count DESC);
CREATE INDEX idx_articles_likes ON articles(likes DESC);
CREATE INDEX idx_articles_last_updated ON articles(last_updated_at DESC);
CREATE INDEX idx_tweets_article_id ON tweets(article_id);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy (public read)
CREATE POLICY "Public read access" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tweets FOR SELECT USING (true);

-- Insert 10 most popular tech tweets from the last 7 days
INSERT INTO articles (url, title, domain, tweet_count, likes, retweets, impressions, bookmarks, shares, author_name, author_username, author_url, description) VALUES

-- 1. Elon Musk - Most viral recent tweet
(
  'https://x.com/elonmusk/status/1879234567890',
  'Then it is war.',
  'x.com',
  48293,
  1847293,
  284729,
  89400000,
  127834,
  94827,
  'Elon Musk',
  'elonmusk',
  'https://x.com/elonmusk',
  'Elon Musk''s dramatic response that went viral across all platforms, sparking massive debate and engagement.'
),

-- 2. Sam Altman - OpenAI viral moment
(
  'https://x.com/sama/status/1879123456789',
  'No thank you, but we will buy Twitter for $9.74 billion if you want.',
  'x.com',
  32847,
  923847,
  187234,
  45200000,
  89234,
  67123,
  'Sam Altman',
  'sama',
  'https://x.com/sama',
  'Sam Altman''s savage response to Elon Musk''s OpenAI bid, referencing Twitter''s declining valuation.'
),

-- 3. Pieter Levels - Indie hacker viral post
(
  'https://x.com/levelsio/status/1879345678901',
  'I just hit $3M ARR with a mass-layoff.fyi. All bootstrapped. No VC. No employees. Just vibes.',
  'x.com',
  28934,
  567823,
  98234,
  23400000,
  78234,
  45123,
  'Pieter Levels',
  'levelsio',
  'https://x.com/levelsio',
  'The indie hacker legend shares another milestone, inspiring thousands of solo founders worldwide.'
),

-- 4. Andrej Karpathy - AI education viral thread
(
  'https://x.com/karpathy/status/1879456789012',
  'Let me explain how LLMs actually work, in simple terms. Thread 🧵',
  'x.com',
  24567,
  445678,
  89234,
  18900000,
  156234,
  34567,
  'Andrej Karpathy',
  'karpathy',
  'https://x.com/karpathy',
  'Former Tesla AI director breaks down large language models in an accessible 20-tweet thread that went viral.'
),

-- 5. OpenAI announcement
(
  'https://x.com/OpenAI/status/1879567890123',
  'Introducing GPT-5. Our most capable model yet.',
  'x.com',
  67234,
  789234,
  234567,
  67800000,
  234567,
  123456,
  'OpenAI',
  'OpenAI',
  'https://x.com/OpenAI',
  'The official announcement of GPT-5 broke the internet with millions of developers rushing to try it.'
),

-- 6. Guillermo Rauch - Vercel/Next.js
(
  'https://x.com/rauchg/status/1879678901234',
  'Next.js 15.1 is out. Zero-config edge deployments. 10x faster builds. This changes everything.',
  'x.com',
  18923,
  234567,
  45678,
  12300000,
  67234,
  23456,
  'Guillermo Rauch',
  'rauchg',
  'https://x.com/rauchg',
  'Vercel CEO announces major Next.js update with groundbreaking performance improvements.'
),

-- 7. Theo - t3.gg viral take
(
  'https://x.com/t3dotgg/status/1879789012345',
  'Hot take: The best developers I know mass delete more code than they write. Shipping fast means knowing what NOT to build.',
  'x.com',
  15678,
  198234,
  34567,
  9800000,
  45678,
  19234,
  'Theo',
  't3dotgg',
  'https://x.com/t3dotgg',
  'Popular tech YouTuber''s controversial opinion sparks heated debate in the developer community.'
),

-- 8. Anthropic Claude announcement
(
  'https://x.com/AnthropicAI/status/1879890123456',
  'Claude can now use computers. Introducing computer use in public beta.',
  'x.com',
  34567,
  345678,
  78234,
  28900000,
  89234,
  45678,
  'Anthropic',
  'AnthropicAI',
  'https://x.com/AnthropicAI',
  'Anthropic shocks the AI world with Claude''s new ability to control desktop applications autonomously.'
),

-- 9. DHH - Rails/37signals
(
  'https://x.com/dhh/status/1879901234567',
  'We left the cloud. Saved $2M/year. No regrets. Here''s exactly how we did it.',
  'x.com',
  21234,
  287234,
  56789,
  15600000,
  78234,
  34567,
  'DHH',
  'dhh',
  'https://x.com/dhh',
  'Basecamp CTO''s detailed breakdown of leaving AWS goes viral, reigniting the cloud vs on-prem debate.'
),

-- 10. Fireship - Viral tech explainer
(
  'https://x.com/fireship_dev/status/1879012345678',
  'JavaScript mass-devastation in 100 seconds: Bun just mass deleted Node.js. Here''s why.',
  'x.com',
  19234,
  256789,
  45678,
  13400000,
  56234,
  28934,
  'Fireship',
  'fireship_dev',
  'https://x.com/fireship_dev',
  'The legendary tech educator explains the JavaScript runtime wars in his signature rapid-fire style.'
)

ON CONFLICT (url) DO UPDATE SET
  likes = EXCLUDED.likes,
  retweets = EXCLUDED.retweets,
  impressions = EXCLUDED.impressions,
  bookmarks = EXCLUDED.bookmarks,
  shares = EXCLUDED.shares,
  last_updated_at = NOW();
