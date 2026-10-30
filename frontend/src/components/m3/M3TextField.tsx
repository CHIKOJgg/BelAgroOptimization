import React from 'react';

interface M3TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const M3TextField: React.FC<M3TextFieldProps> = ({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const inputId = id || (label ? `m3-input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`text-xs font-medium tracking-tight ${
            error
              ? 'text-[var(--md-sys-color-error)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          {label}
        </label>
      )}

      <div
        className={`relative flex items-center h-11 px-3 rounded-[8px] border transition-colors duration-200 bg-[var(--md-sys-color-surface-container-lowest)] ${
          error
            ? 'border-[var(--md-sys-color-error)] ring-1 ring-[var(--md-sys-color-error)]/30'
            : 'border-[var(--md-sys-color-outline-variant)] focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)]/20'
        } ${disabled ? 'opacity-40 bg-[var(--md-sys-color-surface-container-low)] pointer-events-none' : ''}`}
      >
        {leadingIcon && (
          <span className="text-[var(--md-sys-color-on-surface-variant)] mr-2 shrink-0">
            {leadingIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className="w-full bg-transparent text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-outline)] outline-none"
          {...props}
        />

        {trailingIcon && (
          <span className="text-[var(--md-sys-color-on-surface-variant)] ml-2 shrink-0">
            {trailingIcon}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <span
          className={`text-[11px] px-1 ${
            error
              ? 'text-[var(--md-sys-color-error)] font-medium'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};
