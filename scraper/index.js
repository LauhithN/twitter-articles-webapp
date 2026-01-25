import Parser from 'rss-parser'
import { createClient } from '@supabase/supabase-js'
import { getWorkingInstance, getAccountFeedUrls, ARTICLE_AUTHORS } from './sources.js'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; TwitterArticlesScraper/1.0)',
  },
})

// Initialize Supabase client
// IMPORTANT: Load from environment variables - NEVER hardcode credentials!
// This must be the SERVICE ROLE key (not anon key) for write operations
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  console.error('Note: SUPABASE_SERVICE_KEY must be the service role key, not the anon key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Check if running in dry-run mode
const isDryRun = process.argv.includes('--dry-run')

// Patterns to identify X/Twitter article URLs
const ARTICLE_URL_PATTERNS = [
  /https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/g,  // Regular tweet/article URLs
  /https?:\/\/(twitter\.com|x\.com)\/i\/article\/\d+/g,   // Direct article URLs
]

// Extract article URLs from tweet content
function extractArticleUrls(text) {
  const urls = []
  for (const pattern of ARTICLE_URL_PATTERNS) {
    const matches = text.match(pattern) || []
    urls.push(...matches)
  }
  return [...new Set(urls)] // Dedupe
}

// Check if content looks like a long-form article (has substantial text)
function isLongFormContent(text) {
  // Articles typically have more content
  const cleanText = text.replace(/<[^>]*>/g, '').trim()
  return cleanText.length > 280 // Longer than a single tweet
}

// Extract a title from article content
function extractTitle(text, maxLength = 100) {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '').trim()

  // Try to find a clear title pattern (first sentence or line)
  const lines = cleanText.split(/[\n\r]+/).filter(l => l.trim())
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    // If first line is short enough, use it as title
    if (firstLine.length <= maxLength && firstLine.length > 10) {
      return firstLine
    }
  }

  // Otherwise, take first N characters
  if (cleanText.length <= maxLength) {
    return cleanText
  }

  // Cut at word boundary
  const truncated = cleanText.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 50 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

async function fetchFeed(feedUrl, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const feed = await parser.parseURL(feedUrl)
      return feed.items || []
    } catch (error) {
      const isLastAttempt = attempt === maxRetries
      const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000)

      console.error(`Attempt ${attempt}/${maxRetries} failed for ${feedUrl}: ${error.message}`)

      if (isLastAttempt) {
        console.error(`All retries exhausted for ${feedUrl}`)
        return []
      }

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return []
}

// Extract article data from RSS item
function extractArticleFromItem(item, authorUsername) {
  const content = item.content || item.contentSnippet || ''
  const title = extractTitle(content)

  // Get the tweet URL as the article URL
  let articleUrl = item.link || item.guid

  // Convert Nitter URLs back to X.com URLs
  if (articleUrl) {
    articleUrl = articleUrl
      .replace(/nitter\.[^/]+/, 'x.com')
      .replace('twitter.com', 'x.com')
  }

  // Skip if no valid URL
  if (!articleUrl || !articleUrl.includes('/status/')) {
    return null
  }

  // Get author display name from the feed creator field
  const authorName = item.creator || authorUsername

  return {
    url: articleUrl,
    title: title,
    domain: 'x.com',
    authorUsername: authorUsername,
    authorName: authorName,
    authorUrl: `https://x.com/${authorUsername}`,
    description: content.replace(/<[^>]*>/g, '').slice(0, 500),
    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
    tweetId: articleUrl.split('/status/')[1]?.split(/[?#]/)[0],
  }
}

async function upsertArticle(article) {
  const { url, title, domain, authorUsername, authorName, authorUrl, description, pubDate, tweetId } = article

  // Validate required fields
  if (!url || !title || !authorUsername) {
    console.error(`Invalid article data: missing required fields`)
    return null
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    console.error(`Invalid URL format: ${url}`)
    return null
  }

  // Use upsert with ON CONFLICT to handle race conditions atomically
  const { data, error } = await supabase
    .from('articles')
    .upsert({
      url,
      domain,
      title: title.slice(0, 500),
      tweet_count: 1,
      description: description ? description.slice(0, 5000) : null,
      author_name: authorName,
      author_username: authorUsername,
      author_url: authorUrl,
      last_updated_at: new Date().toISOString(),
      // These would need to be fetched from Twitter API for real data
      likes: 0,
      retweets: 0,
      impressions: 0,
      bookmarks: 0,
      shares: 0,
    }, {
      onConflict: 'url',
      ignoreDuplicates: false
    })
    .select()

  if (error) {
    console.error(`Failed to upsert article ${url}:`, error.message)
    return null
  }

  console.log(`Upserted: ${title.slice(0, 50)}...`)
  return data
}

async function cleanOldArticles() {
  // Remove articles older than 7 days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)

  // First count what will be deleted (safety check)
  const { count, error: countError } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .lt('first_seen_at', cutoff.toISOString())

  if (countError) {
    console.error('Failed to count old articles:', countError.message)
    return
  }

  // Safety check: don't delete if unusually high count
  if (count > 1000) {
    console.warn(`Unusually high deletion count (${count}), skipping cleanup for safety`)
    return
  }

  const { error } = await supabase
    .from('articles')
    .delete()
    .lt('first_seen_at', cutoff.toISOString())

  if (error) {
    console.error('Failed to clean old articles:', error.message)
  } else {
    console.log(`Cleaned up ${count} old articles`)
  }
}

async function main() {
  console.log('Starting X Articles scraper...')
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`)

  try {
    // Get working Nitter instance
    console.log('Finding working Nitter instance...')
    const instance = await getWorkingInstance()
    console.log(`Using instance: ${instance}`)

    // Get feed URLs
    const feedUrls = getAccountFeedUrls(instance)
    console.log(`Fetching ${feedUrls.length} feeds from article authors...`)

    // Collect all articles
    const allArticles = []

    for (let i = 0; i < feedUrls.length; i++) {
      const feedUrl = feedUrls[i]
      const authorUsername = ARTICLE_AUTHORS[i]

      console.log(`Fetching: @${authorUsername}`)
      const items = await fetchFeed(feedUrl)

      for (const item of items) {
        const article = extractArticleFromItem(item, authorUsername)
        if (article) {
          allArticles.push(article)
        }
      }

      // Small delay to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`Found ${allArticles.length} articles`)

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
        console.log(`  - @${article.authorUsername}: ${article.title.slice(0, 60)}...`)
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
