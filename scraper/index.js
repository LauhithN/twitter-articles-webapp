import Parser from 'rss-parser'
import { createClient } from '@supabase/supabase-js'
import { getWorkingInstance, getAccountFeedUrls } from './sources.js'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; TwitterArticlesScraper/1.0)',
  },
})

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Check if running in dry-run mode
const isDryRun = process.argv.includes('--dry-run')

// URL patterns to extract from tweets
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g

// Domains to exclude (Twitter itself, image hosts, etc.)
const EXCLUDED_DOMAINS = [
  'twitter.com',
  'x.com',
  't.co',
  'pic.twitter.com',
  'pbs.twimg.com',
  'video.twimg.com',
  'nitter.net',
  'nitter.poast.org',
  'youtube.com',
  'youtu.be',
  'instagram.com',
  'facebook.com',
  'tiktok.com',
]

function extractUrls(text) {
  const urls = text.match(URL_REGEX) || []
  return urls.filter(url => {
    try {
      const hostname = new URL(url).hostname.toLowerCase()
      return !EXCLUDED_DOMAINS.some(domain =>
        hostname === domain || hostname.endsWith(`.${domain}`)
      )
    } catch {
      return false
    }
  })
}

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

async function resolveRedirect(url, maxRedirects = 3) {
  // Skip if not a t.co link
  if (!url.includes('t.co/')) {
    return url
  }

  try {
    let currentUrl = url
    for (let i = 0; i < maxRedirects; i++) {
      const response = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
      })

      const location = response.headers.get('location')
      if (location && response.status >= 300 && response.status < 400) {
        currentUrl = location
      } else {
        break
      }
    }
    return currentUrl
  } catch {
    return url
  }
}

async function fetchFeed(feedUrl) {
  try {
    const feed = await parser.parseURL(feedUrl)
    return feed.items || []
  } catch (error) {
    console.error(`Failed to fetch feed ${feedUrl}:`, error.message)
    return []
  }
}

async function extractArticlesFromItem(item) {
  const articles = []
  const content = item.content || item.contentSnippet || item.title || ''
  const urls = extractUrls(content)

  for (const url of urls) {
    const resolvedUrl = await resolveRedirect(url)
    const domain = extractDomain(resolvedUrl)

    if (domain) {
      articles.push({
        url: resolvedUrl,
        domain,
        title: item.title || 'Untitled',
        tweetId: item.guid || item.link,
        tweetAuthor: item.creator || 'unknown',
        tweetText: item.contentSnippet || '',
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      })
    }
  }

  return articles
}

async function upsertArticle(article) {
  const { url, domain, title, tweetId, tweetAuthor, tweetText, pubDate } = article

  // First, try to get existing article
  const { data: existing } = await supabase
    .from('articles')
    .select('id, tweet_count')
    .eq('url', url)
    .single()

  if (existing) {
    // Update tweet count
    const { error } = await supabase
      .from('articles')
      .update({
        tweet_count: existing.tweet_count + 1,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) {
      console.error(`Failed to update article ${url}:`, error.message)
    } else {
      console.log(`Updated: ${url} (${existing.tweet_count + 1} tweets)`)
    }

    // Insert tweet record
    await supabase.from('tweets').upsert({
      id: tweetId,
      article_id: existing.id,
      author_username: tweetAuthor,
      text: tweetText,
      created_at: pubDate.toISOString(),
    }, {
      onConflict: 'id',
    })

  } else {
    // Insert new article
    const { data: newArticle, error } = await supabase
      .from('articles')
      .insert({
        url,
        domain,
        title: title.slice(0, 500), // Truncate long titles
        tweet_count: 1,
        description: tweetText.slice(0, 500) || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error(`Failed to insert article ${url}:`, error.message)
    } else {
      console.log(`New article: ${url}`)

      // Insert tweet record
      await supabase.from('tweets').insert({
        id: tweetId,
        article_id: newArticle.id,
        author_username: tweetAuthor,
        text: tweetText,
        created_at: pubDate.toISOString(),
      })
    }
  }
}

async function cleanOldArticles() {
  // Remove articles older than 7 days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)

  const { error } = await supabase
    .from('articles')
    .delete()
    .lt('first_seen_at', cutoff.toISOString())

  if (error) {
    console.error('Failed to clean old articles:', error.message)
  } else {
    console.log('Cleaned up old articles')
  }
}

async function main() {
  console.log('Starting Twitter articles scraper...')
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`)

  try {
    // Get working Nitter instance
    console.log('Finding working Nitter instance...')
    const instance = await getWorkingInstance()
    console.log(`Using instance: ${instance}`)

    // Get feed URLs
    const feedUrls = getAccountFeedUrls(instance)
    console.log(`Fetching ${feedUrls.length} feeds...`)

    // Collect all articles
    const allArticles = []

    for (const feedUrl of feedUrls) {
      console.log(`Fetching: ${feedUrl}`)
      const items = await fetchFeed(feedUrl)

      for (const item of items) {
        const articles = await extractArticlesFromItem(item)
        allArticles.push(...articles)
      }

      // Small delay to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`Found ${allArticles.length} article references`)

    // Deduplicate by URL
    const uniqueUrls = new Map()
    for (const article of allArticles) {
      if (!uniqueUrls.has(article.url)) {
        uniqueUrls.set(article.url, article)
      }
    }

    console.log(`${uniqueUrls.size} unique articles`)

    if (isDryRun) {
      console.log('\nDRY RUN - Would upsert these articles:')
      for (const [url, article] of uniqueUrls) {
        console.log(`  - ${article.domain}: ${article.title.slice(0, 60)}...`)
      }
    } else {
      // Upsert to database
      for (const [url, article] of uniqueUrls) {
        await upsertArticle(article)
      }

      // Clean up old articles
      await cleanOldArticles()
    }

    console.log('Scraping complete!')

  } catch (error) {
    console.error('Scraper failed:', error)
    process.exit(1)
  }
}

main()
