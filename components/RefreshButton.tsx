'use client';

import { useState } from 'react';
import { RefreshIcon } from './Icons';

export function RefreshButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRefresh() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/refresh', { method: 'POST' });

      if (response.ok) {
        setMessage('Refresh queued');
        setTimeout(() => setMessage(null), 3000);
      } else if (response.status === 429) {
        setMessage('Rate limited');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Error');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage('Error');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className="
          group relative
          flex items-center gap-2
          bg-surface-1 border border-border-default
          px-4 py-2
          text-meta font-mono uppercase tracking-wide
          text-text-secondary
          hover:bg-surface-2 hover:border-accent hover:text-accent
          transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <RefreshIcon
          className={`w-4 h-4 transition-transform duration-300 ${
            isLoading ? 'animate-spin' : 'group-hover:rotate-180'
          }`}
        />
        <span>{isLoading ? 'LOADING' : 'REFRESH'}</span>
      </button>
      {message && (
        <span
          className={`
            text-meta font-mono
            ${message === 'Refresh queued' ? 'text-viral-rising' : 'text-viral-hot'}
          `}
        >
          {message}
        </span>
      )}
    </div>
  );
}
