// Vertical glass sidebar - Server Component

import { FireIcon, TrendingUpIcon, BookmarkIcon, ChartIcon } from './Icons';

export function Sidebar() {
  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <nav className="flex flex-col gap-3">
        <SidebarIcon icon={FireIcon} label="Trending" active />
        <SidebarIcon icon={TrendingUpIcon} label="Rising" />
        <SidebarIcon icon={BookmarkIcon} label="Saved" />
        <SidebarIcon icon={ChartIcon} label="Analytics" />
      </nav>
    </aside>
  );
}

interface SidebarIconProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}

function SidebarIcon({ icon: Icon, label, active = false }: SidebarIconProps) {
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
      aria-label={label}
      title={label}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-white/90' : 'text-white/70'}`} />

      {/* Tooltip */}
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
