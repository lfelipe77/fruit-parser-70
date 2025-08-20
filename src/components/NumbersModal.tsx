import React from "react";
import { X, TicketIcon } from "lucide-react";
import { brl } from "@/lib/format";

export function NumbersModal({
  title,
  ticketCount,
  value,
  numbers,
  onClose,
}: {
  title: string;
  ticketCount: number;
  value: number;
  numbers: string[];   // already processed
  onClose: () => void;
}) {
  const list = Array.isArray(numbers) ? numbers : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Meus Números</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              {title}
            </p>
            <p className="text-xs text-gray-500">
              {ticketCount} bilhetes • {brl(value)}
            </p>
          </div>

          {list.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TicketIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Compra anterior ao novo sistema de números</p>
              <p className="text-xs mt-1">Números não disponíveis para esta compra</p>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((combo, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="font-mono text-sm font-medium">({combo})</span>
                  <span className="text-xs text-emerald-700">Bilhete #{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}