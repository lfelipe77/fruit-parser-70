import React from "react";

type Props = {
  value: number; // 0..100
  className?: string;
  showLabel?: boolean;
};

export default function ProgressBar({ value, className = "", showLabel = true }: Props) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  return (
    <div className={`w-full rounded-2xl bg-muted p-1 ${className}`} aria-label="Progresso da rifa">
      <div
        className="h-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      {showLabel && (
        <div className="mt-1 text-right text-xs font-medium text-muted-foreground">
          {pct.toFixed(0)}%
        </div>
      )}
    </div>
  );
}