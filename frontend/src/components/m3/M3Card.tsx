import React from 'react';

export type M3CardVariant = 'elevated' | 'filled' | 'outlined';

interface M3CardProps {
  variant?: M3CardVariant;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
}

export const M3Card: React.FC<M3CardProps> = ({
  variant = 'elevated',
  title,
  subtitle,
  action,
  icon,
  children,
  className = '',
  style,
  onClick,
  interactive = false,
}) => {
  const variantClasses = {
    elevated:
      'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] shadow-[var(--md-sys-elevation-1)] ' +
      (interactive || onClick
        ? 'hover:shadow-[var(--md-sys-elevation-2)] active:shadow-[var(--md-sys-elevation-1)] cursor-pointer m3-state-layer'
        : ''),
    filled:
      'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] ' +
      (interactive || onClick
        ? 'hover:shadow-[var(--md-sys-elevation-1)] cursor-pointer m3-state-layer'
        : ''),
    outlined:
      'bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] ' +
      (interactive || onClick
        ? 'hover:shadow-[var(--md-sys-elevation-1)] hover:border-[var(--md-sys-color-outline)] cursor-pointer m3-state-layer'
        : ''),
  }[variant];

  return (
    <div
      onClick={onClick}
      style={style}
      className={`rounded-[16px] p-5 transition-all duration-200 ${variantClasses} ${className}`}
    >
      {(title || action || icon) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <div className="text-base font-semibold tracking-tight text-[var(--md-sys-color-on-surface)] truncate">
                  {title}
                </div>
              )}
              {subtitle && (
                <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
