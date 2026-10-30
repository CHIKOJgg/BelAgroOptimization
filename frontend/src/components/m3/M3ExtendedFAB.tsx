import React from 'react';

interface M3ExtendedFABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: React.ReactNode;
  variant?: 'primary' | 'surface' | 'secondary' | 'tertiary';
}

export const M3ExtendedFAB: React.FC<M3ExtendedFABProps> = ({
  icon,
  label,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary:
      'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:bg-[var(--md-sys-color-primary-container)]/90',
    surface:
      'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)]/30',
    secondary:
      'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
    tertiary:
      'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
  }[variant];

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-3 h-14 px-6 rounded-[16px] font-semibold text-sm tracking-wide shadow-[var(--md-sys-elevation-3)] hover:shadow-[var(--md-sys-elevation-4)] active:shadow-[var(--md-sys-elevation-3)] transition-all duration-200 select-none cursor-pointer m3-state-layer ${variantClasses} ${className}`}
      {...props}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
};
