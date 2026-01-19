import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getArticles(limit: number = 50) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('tweet_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return data
}

export async function getLastUpdatedTime() {
  const { data, error } = await supabase
    .from('articles')
    .select('last_updated_at')
    .order('last_updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return data.last_updated_at
}
