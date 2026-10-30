import React from 'react';

export type M3ButtonVariant = 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';
export type M3ButtonSize = 'sm' | 'md' | 'lg';

interface M3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: M3ButtonVariant;
  size?: M3ButtonSize;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
}

export const M3Button: React.FC<M3ButtonProps> = ({
  children,
  variant = 'filled',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-full',
    md: 'h-10 px-5 text-sm gap-2 rounded-full',
    lg: 'h-12 px-6 text-base gap-2.5 rounded-full',
  }[size];

  const variantClasses = {
    filled:
      'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-[var(--md-sys-elevation-1)] active:shadow-[var(--md-sys-elevation-0)] focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]/40',
    elevated:
      'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-primary)] shadow-[var(--md-sys-elevation-1)] hover:shadow-[var(--md-sys-elevation-2)] active:shadow-[var(--md-sys-elevation-1)] border border-[var(--md-sys-color-outline-variant)]/30',
    tonal:
      'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:shadow-[var(--md-sys-elevation-1)] active:shadow-[var(--md-sys-elevation-0)]',
    outlined:
      'bg-transparent text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-primary)]/5 active:bg-[var(--md-sys-color-primary)]/10',
    text:
      'bg-transparent text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/8 active:bg-[var(--md-sys-color-primary)]/12 px-3',
  }[variant];

  const disabledClasses =
    'disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none';

  return (
    <button
      className={`inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 select-none cursor-pointer m3-state-layer ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
    </button>
  );
};

export const M3IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'standard' | 'filled' | 'tonal' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
  }
> = ({ children, variant = 'standard', size = 'md', className = '', ...props }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-full text-sm',
    md: 'w-10 h-10 rounded-full text-base',
    lg: 'w-12 h-12 rounded-full text-lg',
  }[size];

  const variantClasses = {
    standard:
      'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface-variant)]/8 active:bg-[var(--md-sys-color-on-surface-variant)]/12',
    filled:
      'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-[var(--md-sys-elevation-1)]',
    tonal:
      'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:shadow-[var(--md-sys-elevation-1)]',
    outlined:
      'border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface-variant)]/8',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer m3-state-layer ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
