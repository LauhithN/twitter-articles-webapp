import type { Article } from './types';

const TWITTER_HOSTS = new Set(['x.com', 'twitter.com']);

function normalizeHost(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/^mobile\./, '');
}

export function isTwitterDomain(domain: string | null | undefined): boolean {
  if (!domain) return false;
  return TWITTER_HOSTS.has(normalizeHost(domain));
}

export function isTwitterUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const host = normalizeHost(new URL(url).hostname);
    return TWITTER_HOSTS.has(host);
  } catch {
    return false;
  }
}

export function isTwitterArticle(article: Pick<Article, 'url' | 'domain'>): boolean {
  return isTwitterDomain(article.domain) || isTwitterUrl(article.url);
}
