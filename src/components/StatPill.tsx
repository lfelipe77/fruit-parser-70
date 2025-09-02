interface StatPillProps {
  value: number | string;
  label: string;
}

export function StatPill({ value, label }: StatPillProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200/60 bg-white px-4 py-3">
      <div className="text-xl font-semibold">{value ?? 0}</div>
      <div className="text-xs text-neutral-500 text-center">{label}</div>
    </div>
  );
}