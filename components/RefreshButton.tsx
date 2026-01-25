'use client';

import { useState } from 'react';
import { RefreshIcon } from './Icons';
import { GlassButton } from './GlassButton';

export function RefreshButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleRefresh() {
    setIsLoading(true);
    try {
      await fetch('/api/refresh', { method: 'POST' });
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }

  return (
    <GlassButton onClick={handleRefresh} disabled={isLoading} variant="icon">
      <RefreshIcon
        className={`w-5 h-5 text-white/70 transition-transform duration-500 ${
          isLoading ? 'rotate-180' : ''
        }`}
      />
    </GlassButton>
  );
}
