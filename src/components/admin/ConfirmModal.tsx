import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div className="bg-white border border-[#DFD8CC] max-w-md w-full p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 flex items-center justify-center shrink-0 ${
                danger ? 'bg-red-50 text-red-700' : 'bg-[#F4F1EA] text-[#786651]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl text-[#111111] leading-tight">{title}</h3>
              <p className="mt-2 text-sm text-[#4A4742] leading-relaxed">{description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close modal"
            className="text-[#6E675E] hover:text-[#111111] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#EAE4D9] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs uppercase tracking-[0.12em] border border-[#DFD8CC] text-[#4A4742] hover:border-[#111111] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-xs uppercase tracking-[0.12em] font-medium text-white cursor-pointer disabled:opacity-50 ${
              danger ? 'bg-red-700 hover:bg-red-800' : 'bg-[#111111] hover:bg-[#3A3733]'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
