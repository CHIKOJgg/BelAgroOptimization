import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  color?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate' | 'rose';
  sparkline?: number[];
  targetProgress?: {
    current: number;
    target: number;
    label?: string;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  isPositive,
  icon,
  subtitle,
  color = 'emerald',
  sparkline,
  targetProgress,
}) => {
  const colorStyles = {
    emerald: 'text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/50 border-[var(--md-sys-color-primary)]/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    blue: 'text-[var(--md-sys-color-tertiary)] bg-[var(--md-sys-color-tertiary-container)]/50 border-[var(--md-sys-color-tertiary)]/20',
    purple: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    slate: 'text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] border-[var(--md-sys-color-outline-variant)]/40',
    rose: 'text-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error-container)]/50 border-[var(--md-sys-color-error)]/20',
  };

  const sparklineStroke = {
    emerald: 'var(--md-sys-color-primary)',
    amber: '#f59e0b',
    blue: 'var(--md-sys-color-tertiary)',
    purple: '#6366f1',
    slate: 'var(--md-sys-color-outline)',
    rose: 'var(--md-sys-color-error)',
  }[color];

  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    const width = 80;
    const height = 28;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;

    const points = sparkline.map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height} className="overflow-visible opacity-80 group-hover:opacity-100 transition-opacity">
        <polyline
          fill="none"
          stroke={sparklineStroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.join(' ')}
        />
        <circle
          cx={width}
          cy={height - ((sparkline[sparkline.length - 1] - min) / range) * (height - 6) - 3}
          r="3"
          fill={sparklineStroke}
        />
      </svg>
    );
  };

  return (
    <div className="relative bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[16px] p-5 shadow-[var(--md-sys-elevation-1)] hover:shadow-[var(--md-sys-elevation-2)] hover:border-[var(--md-sys-color-outline-variant)] transition-all duration-200 group overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider truncate">
          {title}
        </span>
        {icon && (
          <div className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-xs ${colorStyles[color]}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value and Sparkline */}
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)] font-['JetBrains_Mono',monospace]">
            {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              {unit}
            </span>
          )}
        </div>
        {renderSparkline()}
      </div>

      {/* Progress Bar towards Target if defined */}
      {targetProgress && (
        <div className="mt-3 pt-2.5 border-t border-[var(--md-sys-color-outline-variant)]/20">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">
              {targetProgress.label || 'Цель'}
            </span>
            <span className="text-[var(--md-sys-color-on-surface)] font-mono font-bold">
              {Math.min(100, Math.round((targetProgress.current / targetProgress.target) * 100))}%
            </span>
          </div>
          <div className="w-full h-2 bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[var(--md-sys-color-primary)]"
              style={{
                width: `${Math.min(100, Math.round((targetProgress.current / targetProgress.target) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer with Change badge and Subtitle */}
      {(change || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
          {change && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                isPositive
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]/20'
                  : 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--md-sys-color-error)]/20'
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-[var(--md-sys-color-on-surface-variant)] text-[11px] truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
