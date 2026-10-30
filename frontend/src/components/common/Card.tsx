import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <div
      className={`bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[16px] p-5 sm:p-6 shadow-[var(--md-sys-elevation-1)] hover:shadow-[var(--md-sys-elevation-2)] transition-all duration-200 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
