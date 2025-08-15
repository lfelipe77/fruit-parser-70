import React, { useEffect } from "react";

export function Toast({
  open,
  onClose,
  title = "Pronto!",
  message,
  duration = 2000,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  duration?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="rounded-xl shadow-lg border bg-white max-w-sm">
        <div className="px-4 py-3">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-gray-700 mt-1">{message}</div>
          <button
            onClick={onClose}
            className="mt-3 text-xs underline text-gray-600"
          >
            fechar
          </button>
        </div>
      </div>
    </div>
  );
}