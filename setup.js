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

async function setup() {
  console.log('🚀 Setting up database with test data...\n')

  let inserted = 0
  let skipped = 0

  for (const article of testArticles) {
    const { error } = await supabase
      .from('articles')
      .insert(article)

    if (error) {
      if (error.code === '23505' || error.code === '42P01') {
        skipped++
        console.log(`⏭️  ${article.title.slice(0, 60)}... (already exists or table not found)`)
      } else {
        console.error(`❌ ${article.title.slice(0, 60)}...`)
        console.error(`   Error: ${error.message}`)
      }
    } else {
      inserted++
      console.log(`✅ ${article.title.slice(0, 60)}...`)
    }
  }

  console.log(`\n📊 Results: ${inserted} inserted, ${skipped} skipped`)

  if (inserted === 0 && skipped === 0) {
    console.log('\n⚠️  Tables may not exist yet. Please run setup-db.sql in Supabase:')
    console.log('   1. Go to your Supabase dashboard')
    console.log('   2. SQL Editor → New query')
    console.log('   3. Copy/paste setup-db.sql contents')
    console.log('   4. Run the query')
    console.log('   5. Then run: node setup.js again\n')
  } else {
    console.log('\n🎉 Success! Refresh http://localhost:3000 to see real data\n')
  }
}

setup().catch(error => {
  console.error('\n❌ Setup failed:', error.message)
  console.log('\nPlease set up the database manually using setup-db.sql in Supabase SQL Editor\n')
})
