export interface Article {
  id: string
  url: string
  title: string
  domain: string
  tweet_count: number
  first_seen_at: string
  last_updated_at: string
  preview_image: string | null
  description: string | null
}

export interface Tweet {
  id: string
  article_id: string
  author_username: string
  author_display_name: string
  text: string
  likes: number
  retweets: number
  created_at: string
  fetched_at: string
}

export interface ArticleWithTweets extends Article {
  tweets?: Tweet[]
}
