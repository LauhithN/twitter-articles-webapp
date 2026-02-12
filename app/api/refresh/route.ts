import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fetchFreshArticlesFromRss } from '@/lib/free-rss';
import type { Article } from '@/lib/types';

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60_000;
const RECENT_ARTICLE_WINDOW_DAYS = 30; // Increased from 14 to 30 days to get more articles

function getClientId(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || 'anonymous';
}

function getServiceSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

function toFullUpsertPayload(article: Article) {
  return {
    url: article.url,
    title: article.title,
    domain: article.domain,
    tweet_count: article.tweet_count,
    first_seen_at: article.first_seen_at,
    likes: article.likes,
    retweets: article.retweets,
    impressions: article.impressions,
    bookmarks: article.bookmarks,
    shares: article.shares,
    author_name: article.author_name,
    author_username: article.author_username,
    author_url: article.author_url,
    last_updated_at: article.last_updated_at,
    description: article.description,
  };
}

function toLegacyUpsertPayload(article: Article) {
  return {
    url: article.url,
    title: article.title,
    domain: article.domain,
    tweet_count: article.tweet_count,
    last_updated_at: article.last_updated_at,
    description: article.description,
  };
}

function getRecentCutoffIso(maxAgeDays: number): string {
  const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  return new Date(cutoffMs).toISOString();
}

async function pruneOldArticles(client: SupabaseClient, maxAgeDays: number): Promise<number> {
  const cutoffIso = getRecentCutoffIso(maxAgeDays);

  const { error: firstSeenError, count: firstSeenCount } = await client
    .from('articles')
    .delete({ count: 'exact' })
    .lt('first_seen_at', cutoffIso);

  if (!firstSeenError) {
    return firstSeenCount ?? 0;
  }

  if (!/column .* does not exist/i.test(firstSeenError.message)) {
    throw firstSeenError;
  }

  const { error: lastUpdatedError, count: lastUpdatedCount } = await client
    .from('articles')
    .delete({ count: 'exact' })
    .lt('last_updated_at', cutoffIso);

  if (lastUpdatedError) {
    throw lastUpdatedError;
  }

  return lastUpdatedCount ?? 0;
}

async function upsertArticles(
  client: SupabaseClient,
  articles: Article[]
): Promise<{ written: number; schemaMode: 'full' | 'legacy' }> {
  const options = { onConflict: 'url', ignoreDuplicates: false };

  const { error: fullError } = await client
    .from('articles')
    .upsert(articles.map(toFullUpsertPayload), options);

  if (!fullError) {
    return { written: articles.length, schemaMode: 'full' };
  }

  if (!/column .* does not exist/i.test(fullError.message)) {
    throw fullError;
  }

  const { error: legacyError } = await client
    .from('articles')
    .upsert(articles.map(toLegacyUpsertPayload), options);

  if (legacyError) {
    throw legacyError;
  }

  return { written: articles.length, schemaMode: 'legacy' };
}

export async function POST(request: Request) {
  const clientId = getClientId(request);
  const now = Date.now();

  const lastRequest = rateLimitMap.get(clientId);
  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return NextResponse.json({ error: 'Rate limited. Try again later.' }, { status: 429 });
  }

  rateLimitMap.set(clientId, now);

  for (const [key, timestamp] of Array.from(rateLimitMap.entries())) {
    if (now - timestamp > RATE_LIMIT_WINDOW * 10) {
      rateLimitMap.delete(key);
    }
  }

  const freshArticles = await fetchFreshArticlesFromRss(200);

  if (freshArticles.length === 0) {
    return NextResponse.json(
      { error: 'No articles found from any source. Try again in a minute.' },
      { status: 503 }
    );
  }

  let persisted = false;
  let written = 0;
  let pruned = 0;
  let schemaMode: 'full' | 'legacy' | 'none' = 'none';

  const supabase = getServiceSupabaseClient();
  if (supabase) {
    try {
      const upsertResult = await upsertArticles(supabase, freshArticles);
      persisted = true;
      written = upsertResult.written;
      schemaMode = upsertResult.schemaMode;
      try {
        pruned = await pruneOldArticles(supabase, RECENT_ARTICLE_WINDOW_DAYS);
      } catch (pruneError) {
        console.error('Failed to prune old articles:', pruneError);
      }
    } catch (error) {
      console.error('Failed to persist refreshed articles:', error);
    }
  }

  revalidatePath('/');

  return NextResponse.json(
    {
      message: persisted
        ? 'Data refreshed and saved to database.'
        : 'Data refreshed from live sources (no database configured).',
      fetched: freshArticles.length,
      persisted,
      written,
      pruned,
      schema_mode: schemaMode,
      recent_window_days: RECENT_ARTICLE_WINDOW_DAYS,
      refreshed_at: new Date().toISOString(),
    },
    { status: persisted ? 200 : 202 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to trigger refresh.' },
    { status: 405 }
  );
}
