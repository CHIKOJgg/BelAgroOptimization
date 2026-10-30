import React from 'react';

export type M3BadgeTone = 'primary' | 'secondary' | 'tertiary' | 'error' | 'surface' | 'neutral';

interface M3BadgeProps {
  children: React.ReactNode;
  tone?: M3BadgeTone;
  variant?: M3BadgeTone;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const M3Badge: React.FC<M3BadgeProps> = ({
  children,
  tone,
  variant,
  icon,
  className = '',
  size = 'md',
}) => {
  const effectiveTone = tone || variant || 'primary';
  const toneClasses = {
    primary:
      'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]/20',
    secondary:
      'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border border-[var(--md-sys-color-secondary)]/20',
    tertiary:
      'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] border border-[var(--md-sys-color-tertiary)]/20',
    error:
      'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border border-[var(--md-sys-color-error)]/20',
    surface:
      'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]',
    neutral:
      'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]',
  }[effectiveTone];

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-[8px] gap-1',
    md: 'text-xs px-2.5 py-1 rounded-[8px] gap-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium tracking-tight select-none ${sizeClasses} ${toneClasses} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
