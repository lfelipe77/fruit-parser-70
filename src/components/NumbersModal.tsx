import React from "react";
import { X, TicketIcon } from "lucide-react";
import { brl } from "@/lib/format";

type Props = { title: string; price: number; qty: number; numbers: string[]; onClose: () => void };

export function NumbersModal({ title, price, qty, numbers, onClose }: Props) {
  const hasNumbers = Array.isArray(numbers) && numbers.length > 0;

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
              {qty} bilhetes • {brl(price)}
            </p>
          </div>

          {hasNumbers ? (
            <ul className="mt-3 grid gap-2">
              {numbers.map((c, i) => (
                <li key={i} className="rounded border px-2 py-1 text-sm">{c}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 text-center text-sm text-gray-500">
              <div className="text-4xl mb-2">🎟️</div>
              Compra anterior ao novo sistema de números
              <div className="mt-1">Números não disponíveis para esta compra</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}