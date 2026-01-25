'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [_isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsHydrated(true);
  }, [key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// Hook for tracking bookmarked article IDs
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>('viral-articles-bookmarks', []);

  const toggleBookmark = useCallback(
    (articleId: string) => {
      setBookmarks(prev => {
        if (prev.includes(articleId)) {
          return prev.filter(id => id !== articleId);
        }
        return [...prev, articleId];
      });
    },
    [setBookmarks]
  );

  const isBookmarked = useCallback(
    (articleId: string) => {
      return bookmarks.includes(articleId);
    },
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, isBookmarked, count: bookmarks.length };
}

// Hook for tracking last visit timestamp
export function useLastVisit() {
  const [lastVisit, setLastVisit] = useLocalStorage<string | null>(
    'viral-articles-last-visit',
    null
  );

  const updateLastVisit = useCallback(() => {
    setLastVisit(new Date().toISOString());
  }, [setLastVisit]);

  const isNewSince = useCallback(
    (dateString: string) => {
      if (!lastVisit) return false;
      return new Date(dateString) > new Date(lastVisit);
    },
    [lastVisit]
  );

  return { lastVisit, updateLastVisit, isNewSince };
}
