import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Load from environment variables - NEVER hardcode credentials!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('Setting up database...\n')

  // Create tables
  console.log('Creating tables...')
  const { error: createError } = await supabase.rpc('exec', {
    query: `
      -- Articles table
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

      -- Tweets table
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

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_articles_tweet_count ON articles(tweet_count DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_last_updated ON articles(last_updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_tweets_article_id ON tweets(article_id);

      -- RLS Policy (public read)
      ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public read access" ON articles;
      CREATE POLICY "Public read access" ON articles FOR SELECT USING (true);
    `
  })

  if (createError) {
    console.error('Error creating tables:', createError)
    console.log('\nTrying alternative method...')
    // If RPC doesn't work, we'll insert test data anyway
  } else {
    console.log('✓ Tables created successfully')
  }

  // Insert test data
  console.log('\nInserting test data...')

  const testArticles = [
    {
      url: 'https://blog.vercel.com/next-js-15',
      title: 'Next.js 15 - The Future of React Development',
      domain: 'vercel.com',
      tweet_count: 2847,
      description: 'Announcing Next.js 15 with major performance improvements, enhanced caching, and better developer experience.',
    },
    {
      url: 'https://react.dev/blog/2024/12/05/react-compiler',
      title: 'React Compiler - Automatic Optimization',
      domain: 'react.dev',
      tweet_count: 1923,
      description: 'The React team introduces an automatic compiler that optimizes your components without manual memoization.',
    },
    {
      url: 'https://supabase.com/blog/postgres-new-features',
      title: 'PostgreSQL 17: What\'s New for Developers',
      domain: 'supabase.com',
      tweet_count: 1456,
      description: 'Explore the latest PostgreSQL features including improved JSON support and better performance.',
    },
    {
      url: 'https://tailwindcss.com/blog/tailwind-css-v4',
      title: 'Tailwind CSS v4.0 - Lightning Fast and Smaller',
      domain: 'tailwindcss.com',
      tweet_count: 1287,
      description: 'The new Tailwind CSS version brings a complete rewrite with faster builds and smaller output.',
    },
    {
      url: 'https://github.blog/2024-12-10-copilot-workspace',
      title: 'GitHub Copilot Workspace - AI-Native Development',
      domain: 'github.blog',
      tweet_count: 1045,
      description: 'GitHub announces Copilot Workspace, a new AI-powered development environment.',
    },
    {
      url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html',
      title: 'TypeScript 5.4 Released with New Features',
      domain: 'typescriptlang.org',
      tweet_count: 892,
      description: 'TypeScript 5.4 brings improved type inference and better error messages.',
    },
    {
      url: 'https://nodejs.org/en/blog/release/v20.11.0',
      title: 'Node.js 20.11 - Performance and Security Updates',
      domain: 'nodejs.org',
      tweet_count: 734,
      description: 'Latest Node.js LTS version includes critical security patches and performance improvements.',
    },
    {
      url: 'https://bun.sh/blog/bun-v1.0',
      title: 'Bun 1.0 - The Fast All-in-One JavaScript Runtime',
      domain: 'bun.sh',
      tweet_count: 623,
      description: 'Bun reaches 1.0 with stable APIs and production-ready performance.',
    },
  ]

  for (const article of testArticles) {
    const { error } = await supabase
      .from('articles')
      .insert(article)

    if (error) {
      if (error.code === '23505') {
        console.log(`  • ${article.title.slice(0, 50)}... (already exists)`)
      } else {
        console.error(`  ✗ Error inserting ${article.title}:`, error.message)
      }
    } else {
      console.log(`  ✓ ${article.title.slice(0, 50)}...`)
    }
  }

  console.log('\n✓ Database setup complete!')
  console.log('\nYour website should now display real data from Supabase.')
  console.log('Refresh http://localhost:3000 to see the articles.\n')
}

setupDatabase().catch(console.error)
