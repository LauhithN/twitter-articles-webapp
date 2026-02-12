import type { Article } from './types';

export function getWeightedEngagement(
  article: Pick<Article, 'likes' | 'retweets' | 'replies'>
): number {
  return article.likes + article.retweets * 2 + article.replies * 1.5;
}

export function getTotalEngagement(
  article: Pick<Article, 'likes' | 'retweets' | 'replies'>
): number {
  return article.likes + article.retweets + article.replies;
}
