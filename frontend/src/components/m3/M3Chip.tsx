import React from 'react';
import { Check } from 'lucide-react';

interface M3ChipProps {
  label: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
}

export const M3Chip: React.FC<M3ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  removable = false,
  onRemove,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-8 px-3 rounded-[8px] text-xs font-medium tracking-tight transition-all duration-200 select-none cursor-pointer m3-state-layer border ${
        selected
          ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-transparent shadow-[var(--md-sys-elevation-0)] font-semibold'
          : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
      } ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      {selected ? (
        <Check className="w-3.5 h-3.5 text-[var(--md-sys-color-on-secondary-container)] stroke-[2.5]" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{label}</span>
      {removable && onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        >
          ×
        </span>
      )}
    </button>
  );
};
