import React from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;
}

export function BottomSheet({ isOpen, onClose, children, zIndex = 100 }: BottomSheetProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-[430px] rounded-t-2xl bg-white pb-20 shadow-xl animate-slide-up">
        {children}
      </div>
    </div>,
    document.body
  );
}
