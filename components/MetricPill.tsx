// Styled engagement metrics - Server Component

import { HeartIcon, RetweetIcon, ChartIcon } from './Icons';
import { formatNumber } from '@/lib/utils';

type MetricType = 'likes' | 'retweets' | 'impressions';

interface MetricPillProps {
  type: MetricType;
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const metricConfig: Record<
  MetricType,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    hotThreshold: number;
    viralThreshold: number;
  }
> = {
  likes: {
    icon: HeartIcon,
    label: 'Likes',
    hotThreshold: 10_000,
    viralThreshold: 100_000,
  },
  retweets: {
    icon: RetweetIcon,
    label: 'Reposts',
    hotThreshold: 5_000,
    viralThreshold: 50_000,
  },
  impressions: {
    icon: ChartIcon,
    label: 'Views',
    hotThreshold: 1_000_000,
    viralThreshold: 50_000_000,
  },
};

export function MetricPill({ type, value, size = 'md', showLabel = false }: MetricPillProps) {
  const config = metricConfig[type];
  const Icon = config.icon;

  const isViral = value >= config.viralThreshold;
  const isHot = value >= config.hotThreshold;

  const colorClass = isViral
    ? 'text-viral-explosive'
    : isHot
      ? 'text-viral-hot'
      : 'text-text-muted';

  const sizeClasses = {
    sm: 'text-caption',
    md: 'text-metric',
    lg: 'text-metric-lg',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`flex items-center gap-1.5 ${colorClass} transition-colors`}>
      <Icon className={iconSizes[size]} />
      <span className={`font-mono ${sizeClasses[size]} tabular-nums`}>{formatNumber(value)}</span>
      {showLabel && (
        <span className="text-label text-text-muted uppercase tracking-wider hidden sm:inline">
          {config.label}
        </span>
      )}
    </div>
  );
}

// Large metric display for hero sections
interface MetricLargeProps {
  likes: number;
  retweets: number;
  impressions: number;
}

export function MetricLarge({ likes, retweets, impressions }: MetricLargeProps) {
  return (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <div className="font-mono text-metric-xl text-viral-explosive tabular-nums">
          {formatNumber(likes)}
        </div>
        <div className="text-label text-text-muted uppercase tracking-widest mt-1">Likes</div>
      </div>
      <div className="w-px h-12 bg-border-subtle" />
      <div className="text-center">
        <div className="font-mono text-metric-xl text-viral-hot tabular-nums">
          {formatNumber(retweets)}
        </div>
        <div className="text-label text-text-muted uppercase tracking-widest mt-1">Reposts</div>
      </div>
      <div className="w-px h-12 bg-border-subtle" />
      <div className="text-center">
        <div className="font-mono text-metric-xl text-accent tabular-nums">
          {formatNumber(impressions)}
        </div>
        <div className="text-label text-text-muted uppercase tracking-widest mt-1">Views</div>
      </div>
    </div>
  );
}

// Compact metrics row
interface MetricRowProps {
  likes: number;
  retweets: number;
  impressions: number;
  size?: 'sm' | 'md';
}

export function MetricRow({ likes, retweets, impressions, size = 'md' }: MetricRowProps) {
  return (
    <div className="flex items-center gap-4">
      <MetricPill type="likes" value={likes} size={size} />
      <MetricPill type="retweets" value={retweets} size={size} />
      <MetricPill type="impressions" value={impressions} size={size} />
    </div>
  );
}
