import { RefreshButton } from './RefreshButton'
import { formatTimeAgo } from '@/lib/utils'

interface HeaderProps {
  lastUpdated: string | null
}

export function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="border-b-2 border-black pb-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Viral Articles
          </h1>
          <p className="text-body text-muted mt-1">
            Most viral X articles in the last 7 days
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <RefreshButton />
          {lastUpdated && (
            <p className="text-meta text-muted">
              Last updated: {formatTimeAgo(lastUpdated)}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
