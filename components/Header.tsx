import { Suspense } from 'react';
import { RefreshButton } from './RefreshButton';
import { TimeFilter } from './TimeFilter';
import { formatTimeAgo } from '@/lib/utils';

interface HeaderProps {
  lastUpdated: string | null;
}

export function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="border-b border-border-subtle pb-6 mb-8">
      <div className="flex flex-col gap-6">
        {/* Top row: Title + Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-display sm:text-display-lg font-bold text-text-primary tracking-tight">
              Viral Articles
            </h1>
            <p className="text-body text-text-secondary mt-1">
              Most viral X articles, updated hourly
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <RefreshButton />
            {lastUpdated && (
              <p className="text-meta text-text-muted">Updated {formatTimeAgo(lastUpdated)}</p>
            )}
          </div>
        </div>

        {/* Time filter tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Suspense fallback={<TimeFilterSkeleton />}>
            <TimeFilter defaultValue="week" />
          </Suspense>

          {/* Optional: Article count or other metadata */}
          <div className="text-caption text-text-muted font-mono">Top trending content</div>
        </div>
      </div>
    </header>
  );
}

function TimeFilterSkeleton() {
  return (
    <div className="flex items-center gap-1 p-1 bg-surface-1 border border-border-subtle">
      <div className="h-10 w-20 skeleton rounded" />
      <div className="h-10 w-24 skeleton rounded" />
      <div className="h-10 w-28 skeleton rounded" />
    </div>
  );
}
