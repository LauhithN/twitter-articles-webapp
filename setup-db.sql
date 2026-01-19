-- Create Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  tweet_count INTEGER DEFAULT 0,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  preview_image TEXT,
  description TEXT
);

-- Create Tweets table
CREATE TABLE IF NOT EXISTS tweets (
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
CREATE INDEX IF NOT EXISTS idx_articles_tweet_count ON articles(tweet_count DESC);
CREATE INDEX IF NOT EXISTS idx_articles_last_updated ON articles(last_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tweets_article_id ON tweets(article_id);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public read access" ON articles;

-- Create RLS Policy (public read)
CREATE POLICY "Public read access" ON articles FOR SELECT USING (true);

-- Insert test data
INSERT INTO articles (url, title, domain, tweet_count, description) VALUES
('https://blog.vercel.com/next-js-15', 'Next.js 15 - The Future of React Development', 'vercel.com', 2847, 'Announcing Next.js 15 with major performance improvements, enhanced caching, and better developer experience.'),
('https://react.dev/blog/2024/12/05/react-compiler', 'React Compiler - Automatic Optimization', 'react.dev', 1923, 'The React team introduces an automatic compiler that optimizes your components without manual memoization.'),
('https://supabase.com/blog/postgres-new-features', 'PostgreSQL 17: What''s New for Developers', 'supabase.com', 1456, 'Explore the latest PostgreSQL features including improved JSON support and better performance.'),
('https://tailwindcss.com/blog/tailwind-css-v4', 'Tailwind CSS v4.0 - Lightning Fast and Smaller', 'tailwindcss.com', 1287, 'The new Tailwind CSS version brings a complete rewrite with faster builds and smaller output.'),
('https://github.blog/2024-12-10-copilot-workspace', 'GitHub Copilot Workspace - AI-Native Development', 'github.blog', 1045, 'GitHub announces Copilot Workspace, a new AI-powered development environment.'),
('https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html', 'TypeScript 5.4 Released with New Features', 'typescriptlang.org', 892, 'TypeScript 5.4 brings improved type inference and better error messages.'),
('https://nodejs.org/en/blog/release/v20.11.0', 'Node.js 20.11 - Performance and Security Updates', 'nodejs.org', 734, 'Latest Node.js LTS version includes critical security patches and performance improvements.'),
('https://bun.sh/blog/bun-v1.0', 'Bun 1.0 - The Fast All-in-One JavaScript Runtime', 'bun.sh', 623, 'Bun reaches 1.0 with stable APIs and production-ready performance.')
ON CONFLICT (url) DO NOTHING;
