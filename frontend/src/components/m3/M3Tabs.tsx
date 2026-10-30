import React from 'react';

export interface M3TabItem<T extends string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface M3TabsProps<T extends string> {
  tabs: M3TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function M3Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'primary',
}: M3TabsProps<T>) {
  if (variant === 'secondary') {
    return (
      <div className={`flex items-center gap-1.5 p-1 rounded-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 overflow-x-auto ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 select-none cursor-pointer m3-state-layer ${
                isActive
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && <span className="ml-1">{tab.badge}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex border-b border-[var(--md-sys-color-outline-variant)]/60 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold tracking-tight whitespace-nowrap transition-colors duration-200 cursor-pointer m3-state-layer ${
              isActive
                ? 'text-[var(--md-sys-color-primary)]'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="ml-1">{tab.badge}</span>}

            {/* Active Indicator Bar */}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.75 bg-[var(--md-sys-color-primary)] rounded-t-full shadow-xs" />
            )}
          </button>
        );
      })}
    </div>
  );
}
