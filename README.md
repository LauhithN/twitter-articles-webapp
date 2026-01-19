# Popular on X

A fast, brutalist webapp displaying the most popular articles shared on Twitter/X.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React Server Components
- **Styling**: Tailwind CSS (brutalist design)
- **Database**: Supabase (PostgreSQL)
- **Data Collection**: Node.js scraper + GitHub Actions
- **Hosting**: Vercel
- **MCP Integration**: Supabase MCP Server (optional)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run this SQL in the SQL Editor:

```sql
-- Articles table
CREATE TABLE articles (
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

-- Indexes
CREATE INDEX idx_articles_tweet_count ON articles(tweet_count DESC);
CREATE INDEX idx_articles_last_updated ON articles(last_updated_at DESC);
CREATE INDEX idx_tweets_article_id ON tweets(article_id);

-- RLS Policy (public read)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON articles FOR SELECT USING (true);
```

3. Copy your API keys from Project Settings > API

### 3. Configure environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scraper Setup

The scraper collects article data from Nitter RSS feeds.

### Local testing

```bash
cd scraper
npm install
node index.js --dry-run  # Test without writing to DB
```

### GitHub Actions

1. Add secrets to your repo:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (use the service role key)

2. The scraper runs automatically every hour

3. Trigger manually from Actions tab if needed

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Design Philosophy

- No AI slop (no gradients, glassmorphism, or excessive rounding)
- Typography-first, high contrast
- Single accent color (#00ff00)
- Brutalist grid, sharp edges
- < 50KB initial JS
- Server Components everywhere

## Cost

- **Vercel**: Free tier (100GB bandwidth)
- **Supabase**: Free tier (500MB database)
- **GitHub Actions**: Free tier (2000 min/month)

**Total: $0/month**

## MCP Integration (Optional)

This project supports the Supabase MCP server, allowing Claude to directly interact with your database.

### Setup

1. Copy the MCP config template:
   ```bash
   cp mcp-config.example.json mcp-config.json
   ```

2. Get your Supabase service role key from your project settings

3. Update `mcp-config.json` with your credentials

4. See [MCP_SETUP.md](MCP_SETUP.md) for detailed instructions

### What You Can Do

With MCP configured, Claude can:
- Query your articles database directly
- Insert/update/delete records
- Run custom SQL queries
- Monitor database health

**Security Note:** Never commit `mcp-config.json` with real credentials!
