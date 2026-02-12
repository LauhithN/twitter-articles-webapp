'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FireIcon, TrendingUpIcon, BookmarkIcon, ChartIcon } from './Icons';
import { DEFAULT_SIDEBAR_VIEW, parseSidebarView, type SidebarView } from '@/lib/article-views';

const sidebarItems: {
  view: SidebarView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { view: 'trending', label: 'Trending', icon: FireIcon },
  { view: 'rising', label: 'Rising', icon: TrendingUpIcon },
  { view: 'saved', label: 'Saved', icon: BookmarkIcon },
  { view: 'analytics', label: 'Analytics', icon: ChartIcon },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeView = parseSidebarView(searchParams.get('view'));

  const handleViewChange = useCallback(
    (view: SidebarView) => {
      const params =
        pathname === '/' ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();

      if (view === DEFAULT_SIDEBAR_VIEW) {
        params.delete('view');
      } else {
        params.set('view', view);
      }

      const queryString = params.toString();
      const target = queryString ? `/?${queryString}` : '/';
      router.push(target, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <nav className="flex flex-col gap-3" aria-label="Article views">
        {sidebarItems.map(item => (
          <SidebarIcon
            key={item.view}
            icon={item.icon}
            label={item.label}
            active={activeView === item.view}
            onClick={() => handleViewChange(item.view)}
          />
        ))}
      </nav>
    </aside>
  );
}

interface SidebarIconProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function SidebarIcon({ icon: Icon, label, active = false, onClick }: SidebarIconProps) {
  return (
    <button
      className={`
        group relative
        flex h-12 w-12 items-center justify-center
        rounded-xl
        glass-highlight
        transition-glass
        hover:scale-[1.04]
        hover:bg-white/10
        active:scale-95
        ${active ? 'bg-white/10' : ''}
      `}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      type="button"
    >
      <Icon className={`w-5 h-5 ${active ? 'text-white/90' : 'text-white/70'}`} />

      <span
        className="
          absolute left-16 px-3 py-1.5
          glass rounded-lg
          text-sm text-white/90
          opacity-0 pointer-events-none
          group-hover:opacity-100
          transition-opacity duration-200
          whitespace-nowrap
        "
      >
        {label}
      </span>
    </button>
  );
}
