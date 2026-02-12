'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshIcon } from './Icons';
import { GlassButton } from './GlassButton';

export function RefreshButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleRefresh() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/refresh', { method: 'POST', cache: 'no-store' });

      if (!response.ok && response.status !== 202) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || `Refresh failed with status ${response.status}`);
      }

      router.refresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 600);
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
