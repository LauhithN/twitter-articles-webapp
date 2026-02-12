import { RefreshButton } from './RefreshButton';
import { formatTimeAgo } from '@/lib/utils';

interface HeaderProps {
  lastUpdated: string | null;
}

export function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="mb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90 mb-2">
            Viral Articles
          </h1>
          <p className="text-sm text-white/50">Most shared on X, refreshed from free feeds</p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-white/40">{formatTimeAgo(lastUpdated)}</span>
          )}
          <RefreshButton />
        </div>
      </div>
    </header>
  );
}
