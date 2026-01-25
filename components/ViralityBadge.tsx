// Virality tier badges - Server Component

import { FireIcon, TrendingUpIcon, ArrowUpIcon } from './Icons';

export type ViralityTier = 'explosive' | 'viral' | 'hot' | 'rising';

interface ViralityBadgeProps {
  impressions: number;
  className?: string;
}

export function getViralityTier(impressions: number): ViralityTier {
  if (impressions >= 100_000_000) return 'explosive';
  if (impressions >= 30_000_000) return 'viral';
  if (impressions >= 10_000_000) return 'hot';
  return 'rising';
}

const tierConfig: Record<
  ViralityTier,
  {
    label: string;
    bgClass: string;
    textClass: string;
    icon: React.ComponentType<{ className?: string }>;
    animate?: boolean;
  }
> = {
  explosive: {
    label: 'EXPLOSIVE',
    bgClass: 'bg-viral-explosive',
    textClass: 'text-white',
    icon: FireIcon,
    animate: true,
  },
  viral: {
    label: 'VIRAL',
    bgClass: 'bg-viral-hot',
    textClass: 'text-black',
    icon: FireIcon,
  },
  hot: {
    label: 'HOT',
    bgClass: 'bg-amber-400',
    textClass: 'text-black',
    icon: TrendingUpIcon,
  },
  rising: {
    label: 'RISING',
    bgClass: 'bg-viral-rising',
    textClass: 'text-black',
    icon: ArrowUpIcon,
  },
};

export function ViralityBadge({ impressions, className = '' }: ViralityBadgeProps) {
  const tier = getViralityTier(impressions);
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        ${config.bgClass} ${config.textClass}
        text-label font-mono uppercase tracking-wider
        ${config.animate ? 'animate-pulse-glow' : ''}
        ${className}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
}

// Compact version for smaller cards
export function ViralityDot({ impressions }: { impressions: number }) {
  const tier = getViralityTier(impressions);

  const dotColors: Record<ViralityTier, string> = {
    explosive: 'bg-viral-explosive',
    viral: 'bg-viral-hot',
    hot: 'bg-amber-400',
    rising: 'bg-viral-rising',
  };

  return (
    <div
      className={`w-2 h-2 rounded-full ${dotColors[tier]} ${tier === 'explosive' ? 'animate-pulse' : ''}`}
      title={tier.charAt(0).toUpperCase() + tier.slice(1)}
    />
  );
}
