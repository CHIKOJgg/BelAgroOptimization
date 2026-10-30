import React from 'react';
import { Check } from 'lucide-react';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface M3SegmentedButtonProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function M3SegmentedButton<T extends string | number>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: M3SegmentedButtonProps<T>) {
  const heightClass = size === 'sm' ? 'h-8 text-xs' : 'h-10 text-xs sm:text-sm';

  return (
    <div
      role="group"
      className={`inline-flex rounded-full p-0.5 border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] ${heightClass} ${className}`}
    >
      {options.map((opt, idx) => {
        const isSelected = opt.value === value;
        const isFirst = idx === 0;
        const isLast = idx === options.length - 1;

        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 font-medium transition-all duration-200 select-none cursor-pointer m3-state-layer relative ${
              isFirst ? 'rounded-l-full' : ''
            } ${isLast ? 'rounded-r-full' : ''} ${
              !isFirst && !isSelected ? 'border-l border-[var(--md-sys-color-outline-variant)]/60' : ''
            } ${
              isSelected
                ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold shadow-xs z-10'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            {isSelected && (
              <Check className="w-3.5 h-3.5 text-[var(--md-sys-color-on-secondary-container)] stroke-[2.5]" />
            )}
            {!isSelected && opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
