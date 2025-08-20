import React, { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { brl, shortDateTime, toComboString, statusLabel } from "@/lib/format";
import { Share2, TicketIcon, ChevronDown } from "lucide-react";

type Row = {
  transaction_id: string;
  raffle_id: string;
  raffle_title: string;
  raffle_image_url: string | null;
  purchase_date: string;             // ISO
  tx_status: string;                 // pending/paid/...
  value: number;                     // R$ total
  ticket_count: number;              // SUM(tickets.qty)
  purchased_numbers: unknown[] | null;
  goal_amount: number;
  amount_raised: number;
  progress_pct_money: number;
  draw_date?: string | null;         // via view
  winner_ticket_id?: string | null;  // via raffles
};

// Robust parser for various purchased_numbers formats
function parsePurchasedNumbers(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((x) =>
        Array.isArray(x) ? x.join("-")
        : typeof x === "string" ? x.trim()
        : ""
      )
      .filter(Boolean);
  }
  if (typeof input === "string") {
    const cleaned = input.replace(/\s+/g, "").replace(/^\[|\]$/g, "");
    return cleaned
      .split(/,(?![^()]*\))|(?<=\))(?=\()/g) // comma OR ")("
      .map((s) => s.replace(/[()]/g, ""))
      .filter(Boolean);
  }
  if (typeof input === "object" && input && "numbers" in (input as any)) {
    return parsePurchasedNumbers((input as any).numbers);
  }
  return [];
}

export default function MyTicketCard({ row }: { row: Row }) {
  const url = `${window.location.origin}/#/ganhavel/${row.raffle_id}`;
  const [open, setOpen] = useState(false);

  const rawCombos = parsePurchasedNumbers(row.purchased_numbers);
  const combos = useMemo(() => rawCombos.map(toComboString).filter(Boolean), [rawCombos]);

  // Never trust ticket_count alone — take the max
  const ticketCount = Math.max(Number(row.ticket_count ?? 0), combos.length);

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
      // Fallback → copy link
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
        return;
      }
      // Last‑resort fallback (older browsers)
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
      // ignore user cancel; optionally show a toast
    }
  }

  const pct = Math.max(0, Math.min(100, Number(row.progress_pct_money ?? 0)));
  const statusTxt = statusLabel[row.tx_status] ?? row.tx_status ?? "—";

  return (
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
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5">
            {statusTxt}
          </span>
          {row.draw_date ? (
            <span className="text-xs text-muted-foreground">
              Próx. sorteio: {shortDateTime(row.draw_date)}
            </span>
          ) : null}
        </div>

        <h3 className="text-base sm:text-lg font-semibold leading-snug">
          {row.raffle_title}
        </h3>

        {/* Money / goal */}
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

        {/* Combos preview line (first 3) */}
        {combos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {combos.slice(0, 3).map((c, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">
                {c}
              </span>
            ))}
            {combos.length > 3 && (
              <button
                className="text-xs inline-flex items-center gap-1 text-emerald-700 hover:underline"
                onClick={() => setOpen(v => !v)}
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
                Ver todos ({combos.length})
              </button>
            )}
          </div>
        )}

        {/* Expand list */}
        {open && combos.length > 0 && (
          <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-sm">
            {combos.map((c, i) => (
              <li key={i} className="rounded border px-2 py-1">
                ({c}) <span className="text-xs text-gray-500">Bilhete #{i + 1}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-2">
          <span className="inline-flex items-center gap-1">
            <TicketIcon className="h-3.5 w-3.5" /> {ticketCount} bilhetes
          </span>
          <span>•</span>
          <span>Compra: {shortDateTime(row.purchase_date)}</span>
          <span>•</span>
          <span>Valor: {brl(row.value)}</span>
        </div>
      </div>

      {/* Right: QR + share + CTA */}
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
  );
}