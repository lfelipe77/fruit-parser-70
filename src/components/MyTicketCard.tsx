import React, { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Share2, ChevronDown, Ticket as TicketIcon } from "lucide-react";
import { brl, shortDateTime, toComboString, statusLabel } from "@/lib/format";
import { NumbersModal } from "@/components/NumbersModal";

type Row = {
  transaction_id: string;
  raffle_id: string;
  raffle_title: string;
  raffle_image_url: string | null;
  purchase_date: string;                 // ISO
  tx_status: string;                     // 'pending' | 'paid' | ...
  value: number;                         // total paid in BRL
  ticket_count: number;                  // SUM(tickets.qty) for the tx
  purchased_numbers: unknown[] | null;   // jsonb array in DB
  goal_amount: number;
  amount_raised: number;
  progress_pct_money: number;
  draw_date?: string | null;             // optional, if present in your view
};

const PREVIEW_COUNT = 4;

export default function MyTicketCard({ row }: { row: Row }) {
  const [showModal, setShowModal] = useState(false);

  // Build public URL for this raffle page
  const url = `${window.location.origin}/#/ganhavel/${row.raffle_id}`;

  // One source of truth for numbers: derive once on the card
  const raw = Array.isArray(row.purchased_numbers) ? row.purchased_numbers : [];
  const combos = useMemo(
    () => raw.map((x) => toComboString(x)).filter(Boolean),
    [raw]
  );

  // Progress % (clamped 0..100)
  const pct = Math.max(0, Math.min(100, Number(row.progress_pct_money ?? 0)));

  // Human label for tx status
  const statusTxt = statusLabel[row.tx_status] ?? row.tx_status ?? "—";

  // Share / clipboard fallback
  async function onShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: row.raffle_title,
          text: "Participe comigo deste Ganhavel!",
          url,
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
        return;
      }
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Link copiado!");
    } catch {
      /* user cancelled */
    }
  }

  return (
    <>
      <article className="w-full rounded-2xl border bg-white shadow-sm p-4 sm:p-5 grid grid-cols-12 gap-4">
        {/* Left: image */}
        <div className="col-span-12 sm:col-span-2 flex items-start">
          <img
            src={row.raffle_image_url ?? "/placeholder.webp"}
            alt={row.raffle_title}
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover border"
            loading="lazy"
          />
        </div>

        {/* Middle: content */}
        <div className="col-span-12 sm:col-span-8 space-y-2">
          {/* Status + next draw (optional) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5">
              {statusTxt}
            </span>
            {row.draw_date ? (
              <span className="text-xs text-gray-500">
                Próx. sorteio: {shortDateTime(row.draw_date)}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold leading-snug">
            {row.raffle_title}
          </h3>

          {/* Raised vs goal */}
          <div className="text-sm text-gray-600">
            {brl(row.amount_raised)} de {brl(row.goal_amount)}
          </div>

          {/* Progress bar */}
          <div className="mt-1 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${pct}%` }}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Numbers preview */}
          {combos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {combos.slice(0, PREVIEW_COUNT).map((c, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded"
                >
                  {c}
                </span>
              ))}
              {combos.length > PREVIEW_COUNT && (
                <button
                  className="text-xs inline-flex items-center gap-1 text-emerald-700 hover:underline"
                  onClick={() => setShowModal(true)}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Ver todos ({combos.length})
                </button>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
              onClick={() => setShowModal(true)}
            >
              <TicketIcon className="h-3.5 w-3.5" />
              {row.ticket_count ?? combos.length} bilhetes
            </button>
            <span>•</span>
            <span>Compra: {shortDateTime(row.purchase_date)}</span>
            <span>•</span>
            <span>Valor: {brl(row.value)}</span>
          </div>
        </div>

        {/* Right: QR + actions */}
        <div className="col-span-12 sm:col-span-2 flex sm:flex-col justify-between sm:justify-start items-end sm:items-center gap-3">
          <div className="bg-white p-1.5 rounded-lg border">
            <QRCode value={url} size={88} />
          </div>
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={onShare}
              className="inline-flex items-center justify-center gap-1 text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto"
              aria-label="Compartilhar Ganhavel"
            >
              <Share2 className="h-3.5 w-3.5" />
              Compartilhar
            </button>
            <a
              href={`#/ganhavel/${row.raffle_id}`}
              className="inline-flex items-center justify-center text-xs px-2 py-1 rounded border hover:bg-gray-50 w-full sm:w-auto"
              aria-label="Ver Ganhavel"
            >
              Ver Ganhavel
            </a>
          </div>
        </div>
      </article>

      {/* Numbers modal renders exactly what the card computed */}
      {showModal && (
        <NumbersModal
          title={row.raffle_title}
          ticketCount={row.ticket_count ?? combos.length}
          value={row.value}
          numbers={combos}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}