import React from "react";
import { X, Ticket } from "lucide-react";
import { brl } from "@/lib/format";

interface NumbersModalProps {
  title: string;
  ticketCount: number;
  value: number;
  numbers: string[];
  onClose: () => void;
}

export default function NumbersModal({ title, ticketCount, value, numbers, onClose }: NumbersModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Meus Bilhetes</h2>
            <p className="text-sm text-gray-600 mt-1">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 border-b bg-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Ticket className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold">{ticketCount} bilhetes</div>
                <div className="text-sm text-gray-600">Valor total: {brl(value)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Numbers List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {numbers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full border flex items-center justify-center">
                <Ticket className="h-5 w-5" />
              </div>
              <div className="font-medium">Números indisponíveis para esta compra</div>
              <div className="text-xs">Compra anterior ao novo sistema de números</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {numbers.map((combo, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </div>
                    <span className="font-mono text-sm">{combo}</span>
                  </div>
                  <span className="text-xs text-gray-500">Bilhete #{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}