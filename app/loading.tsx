// Loading skeleton state

export default function Loading() {
  return (
    <div className="relative-z">
      {/* Header Skeleton */}
      <header className="border-b border-border-subtle pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="h-10 w-48 skeleton rounded" />
            <div className="h-5 w-72 skeleton rounded mt-2" />
          </div>
          <div className="flex flex-col sm:items-end gap-3">
            <div className="h-10 w-64 skeleton rounded" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-24 skeleton rounded" />
              <div className="h-4 w-32 skeleton rounded" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Card Skeleton */}
      <div className="skeleton rounded p-6 md:p-8 mb-6" style={{ minHeight: '280px' }}>
        <div className="pl-16 md:pl-20 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-28 bg-surface-2 rounded" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-surface-2 rounded-full" />
              <div>
                <div className="h-5 w-24 bg-surface-2 rounded" />
                <div className="h-4 w-20 bg-surface-2 rounded mt-1" />
              </div>
            </div>
          </div>
          <div className="h-8 w-3/4 bg-surface-2 rounded" />
          <div className="h-8 w-1/2 bg-surface-2 rounded" />
          <div className="flex items-center gap-8 pt-6 border-t border-surface-2">
            <div className="h-12 w-24 bg-surface-2 rounded" />
            <div className="h-12 w-24 bg-surface-2 rounded" />
            <div className="h-12 w-24 bg-surface-2 rounded" />
          </div>
        </div>
      </div>

      {/* Featured Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2].map(i => (
          <FeaturedCardSkeleton key={i} />
        ))}
      </div>

      {/* Standard Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function FeaturedCardSkeleton() {
  return (
    <div className="skeleton rounded overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-2 rounded" />
          <div className="h-6 w-20 bg-surface-2 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-surface-2 rounded-full" />
          <div>
            <div className="h-4 w-24 bg-surface-2 rounded" />
            <div className="h-3 w-16 bg-surface-2 rounded mt-1" />
          </div>
        </div>
        <div className="h-6 w-full bg-surface-2 rounded" />
        <div className="h-6 w-3/4 bg-surface-2 rounded" />
      </div>
      <div className="p-4 bg-surface-2 border-t border-surface-3">
        <div className="flex items-center gap-4">
          <div className="h-4 w-12 bg-surface-3 rounded" />
          <div className="h-4 w-12 bg-surface-3 rounded" />
          <div className="h-4 w-12 bg-surface-3 rounded" />
        </div>
      </div>
    </div>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="skeleton rounded overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-surface-2 rounded" />
          <div className="w-2 h-2 bg-surface-2 rounded-full" />
          <div className="w-6 h-6 bg-surface-2 rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-20 bg-surface-2 rounded" />
            <div className="h-3 w-14 bg-surface-2 rounded mt-1" />
          </div>
        </div>
        <div className="h-5 w-full bg-surface-2 rounded" />
        <div className="h-5 w-3/4 bg-surface-2 rounded" />
      </div>
      <div className="p-4 bg-surface-2 border-t border-surface-3">
        <div className="flex items-center gap-4">
          <div className="h-4 w-10 bg-surface-3 rounded" />
          <div className="h-4 w-10 bg-surface-3 rounded" />
          <div className="h-4 w-10 bg-surface-3 rounded" />
        </div>
      </div>
    </div>
  );
}
