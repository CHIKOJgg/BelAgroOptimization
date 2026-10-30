import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { M3Dialog } from '../m3/M3Dialog';
import { M3Button } from '../m3/M3Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  return (
    <M3Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      icon={
        <AlertTriangle
          className={`w-5 h-5 ${
            isDestructive
              ? 'text-[var(--md-sys-color-error)]'
              : 'text-amber-500'
          }`}
        />
      }
      maxWidth="sm"
      actions={
        <>
          <M3Button variant="text" size="sm" onClick={onCancel}>
            {cancelLabel}
          </M3Button>
          <M3Button
            variant="filled"
            size="sm"
            onClick={onConfirm}
            className={
              isDestructive
                ? '!bg-[var(--md-sys-color-error)] !text-[var(--md-sys-color-on-error)]'
                : ''
            }
          >
            {confirmLabel}
          </M3Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
        {message}
      </p>
    </M3Dialog>
  );
};
