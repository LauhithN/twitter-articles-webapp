import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Article } from './types';

let supabase: SupabaseClient | null = null;
const RECENT_ARTICLE_WINDOW_DAYS = 14;

function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === 'https://your-project.supabase.co' ||
    supabaseAnonKey === 'your-anon-key'
  ) {
    return null;
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeArticle(row: Record<string, unknown>): Article {
  const nowIso = new Date().toISOString();
  const url = toNullableString(row.url) ?? '#';
  const fallbackTimestamp = toNullableString(row.last_updated_at) ?? nowIso;
  const firstSeenAt = toNullableString(row.first_seen_at) ?? fallbackTimestamp;
  const lastUpdatedAt = toNullableString(row.last_updated_at) ?? firstSeenAt;

  return {
    id: toNullableString(row.id) ?? url,
    url,
    title: toNullableString(row.title) ?? 'Untitled',
    domain: toNullableString(row.domain) ?? 'x.com',
    tweet_count: toNumber(row.tweet_count),
    likes: toNumber(row.likes),
    retweets: toNumber(row.retweets),
    impressions: toNumber(row.impressions),
    bookmarks: toNumber(row.bookmarks),
    shares: toNumber(row.shares),
    author_name: toNullableString(row.author_name),
    author_username: toNullableString(row.author_username),
    author_url: toNullableString(row.author_url),
    first_seen_at: firstSeenAt,
    last_updated_at: lastUpdatedAt,
    preview_image: toNullableString(row.preview_image),
    description: toNullableString(row.description),
  };
}

function getRecentCutoffIso(maxAgeDays: number): string {
  const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  return new Date(cutoffMs).toISOString();
}

function isMissingColumnError(error: { message?: string } | null): boolean {
  return Boolean(error?.message && /column .* does not exist/i.test(error.message));
}

export function isTimestampStale(timestamp: string | null, maxAgeHours: number): boolean {
  if (!timestamp) return true;

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return true;

  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  return Date.now() - parsed.getTime() > maxAgeMs;
}

export async function getArticles(
  limit: number = 50,
  maxAgeDays: number = RECENT_ARTICLE_WINDOW_DAYS
): Promise<Article[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const cutoffIso = getRecentCutoffIso(maxAgeDays);

  try {
    const fullQuery = client
      .from('articles')
      .select('*')
      .gte('first_seen_at', cutoffIso)
      .order('last_updated_at', { ascending: false })
      .order('likes', { ascending: false })
      .limit(limit);
    const { data: fullData, error: fullError } = await fullQuery;

    if (!fullError) {
      return ((fullData as Record<string, unknown>[] | null) ?? []).map(normalizeArticle);
    }

    if (!isMissingColumnError(fullError)) {
      console.error('Error fetching articles:', fullError);
      return [];
    }

    const fallbackQuery = client
      .from('articles')
      .select('*')
      .gte('last_updated_at', cutoffIso)
      .order('last_updated_at', { ascending: false })
      .order('likes', { ascending: false })
      .limit(limit);
    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) {
      console.error('Error fetching articles:', fallbackError);
      return [];
    }

    return ((fallbackData as Record<string, unknown>[] | null) ?? []).map(normalizeArticle);
  } catch (err) {
    console.error('Failed to fetch articles:', err);
    return [];
  }
}

export async function getLastUpdatedTime(maxAgeDays: number = RECENT_ARTICLE_WINDOW_DAYS) {
  const client = getSupabaseClient();
  if (!client) return null;

  const cutoffIso = getRecentCutoffIso(maxAgeDays);

  try {
    const fullQuery = client
      .from('articles')
      .select('last_updated_at')
      .gte('first_seen_at', cutoffIso)
      .order('last_updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: fullData, error: fullError } = await fullQuery;

    if (!fullError) {
      return fullData?.last_updated_at ?? null;
    }

    if (!isMissingColumnError(fullError)) {
      return null;
    }

    const fallbackQuery = client
      .from('articles')
      .select('last_updated_at')
      .gte('last_updated_at', cutoffIso)
      .order('last_updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) return null;
    return fallbackData?.last_updated_at ?? null;
  } catch {
    return null;
  }
}
