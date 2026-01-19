import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured')
    return null
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
  return supabase
}

export async function getArticles(limit: number = 50) {
  const client = getSupabaseClient()
  if (!client) return []

  try {
    const { data, error } = await client
      .from('articles')
      .select('*')
      .order('tweet_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Failed to fetch articles:', err)
    return []
  }
}

export async function getLastUpdatedTime() {
  const client = getSupabaseClient()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('articles')
      .select('last_updated_at')
      .order('last_updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return data.last_updated_at
  } catch {
    return null
  }
}
