// Nitter instances that provide RSS feeds
// These can change/go down, so maintain multiple options
export const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.1d4.us',
]

// Popular tech Twitter accounts to scrape
// These accounts frequently share interesting articles
export const TECH_ACCOUNTS = [
  'levelsio',
  'swyx',
  'raikiasatra',
  'tldrdan',
  'dannypostmaa',
  'marc_louvion',
  'csaborsky',
  't3dotgg',
  'aiaborov',
  'kelseyhightower',
  'adamwathan',
  'dhh',
  'tabortalks',
  'jaredpalmer',
  'leeerob',
  'rauchg',
  'shpigford',
  'paborawski',
  'dvassallo',
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
  return TECH_ACCOUNTS.map(account => `${instance}/${account}/rss`)
}

// Get a working Nitter instance (tries multiple)
export async function getWorkingInstance() {
  for (const instance of NITTER_INSTANCES) {
    try {
      const response = await fetch(instance, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      if (response.ok) {
        return instance
      }
    } catch {
      console.log(`Instance ${instance} is not available`)
    }
  }
  throw new Error('No working Nitter instance found')
}
