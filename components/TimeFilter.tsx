'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export type TimeFilterValue = 'day' | 'week' | 'month';

interface TimeFilterProps {
  defaultValue?: TimeFilterValue;
}

const filters: { value: TimeFilterValue; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export function TimeFilter({ defaultValue = 'week' }: TimeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = (searchParams.get('period') as TimeFilterValue) || defaultValue;

  const handleFilterChange = useCallback(
    (value: TimeFilterValue) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === defaultValue) {
        params.delete('period');
      } else {
        params.set('period', value);
      }
      const query = params.toString();
      router.push(query ? `?${query}` : '/', { scroll: false });
    },
    [router, searchParams, defaultValue]
  );

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-1 border border-border-subtle">
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => handleFilterChange(filter.value)}
          className={`
            px-4 py-2
            text-meta font-mono uppercase tracking-wide
            transition-all duration-150
            ${
              currentFilter === filter.value
                ? 'bg-text-primary text-background'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
