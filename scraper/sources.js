// Nitter instances that provide RSS feeds
// These can change/go down, so maintain multiple options
export const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.1d4.us',
]

// Popular accounts that write Twitter/X Articles (long-form content)
// These accounts frequently publish viral articles on X
export const ARTICLE_AUTHORS = [
  'thedankoe',      // Dan Koe - self-improvement, business
  'naval',          // Naval Ravikant - wealth, philosophy
  'alexhormozi',    // Alex Hormozi - business, marketing
  'levelsio',       // Pieter Levels - indie hacking, startups
  'karpathy',       // Andrej Karpathy - AI, machine learning
  'JamesClear',     // James Clear - habits, productivity
  'SahilBloom',     // Sahil Bloom - business, growth
  'waitbutwhy',     // Tim Urban - long-form essays
  'david_perell',   // David Perell - writing, learning
  'hwang_jesse',    // Jesse Hwang - business
  'dickiebush',     // Dickie Bush - writing, content
  'Nicolascole77',  // Nicolas Cole - writing
  'aaaborukaev',    // Sasha - tech, startups
  'Julian',         // Julian Shapiro - startups, writing
  'george__mack',   // George Mack - thinking, business
  'LifeMathMoney',  // Life Math Money - finance
  'thepatwalls',    // Pat Walls - startups
  'sweatystartup',  // Nick Huber - business
  'ankurnagpal',    // Ankur Nagpal - entrepreneurship
  'ValaAfshar',     // Vala Afshar - tech, business
]

// Alternative: Popular tech hashtag searches (if supported by Nitter instance)
export const SEARCH_TERMS = [
  'programming',
  'webdev',
  'javascript',
  'typescript',
  'startup',
]

// Build RSS feed URLs for accounts
export function getAccountFeedUrls(instance) {
  return ARTICLE_AUTHORS.map(account => `${instance}/${account}/rss`)
}

// Get a working Nitter instance (tries multiple with actual RSS verification)
export async function getWorkingInstance() {
  // Shuffle instances for load balancing
  const shuffled = [...NITTER_INSTANCES].sort(() => Math.random() - 0.5)

  for (const instance of shuffled) {
    try {
      // Test with an actual RSS endpoint (more reliable than just HEAD request)
      const testUrl = `${instance}/${ARTICLE_AUTHORS[0]}/rss`
      const response = await fetch(testUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
        headers: { 'User-Agent': 'TwitterArticlesScraper/1.0' }
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('xml') || contentType.includes('rss')) {
          console.log(`Verified working instance: ${instance}`)
          return instance
        }
      }
    } catch {
      console.log(`Instance ${instance} is not available`)
    }
  }

  // Fallback to first instance instead of crashing - let individual feeds fail gracefully
  console.warn('No verified working Nitter instance found, using first as fallback')
  return NITTER_INSTANCES[0]
}
