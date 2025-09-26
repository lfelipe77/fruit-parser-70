import React from 'react';

interface StatPillProps {
  readonly value: number | string;
  readonly label: string;
}

export const StatPill = React.memo<StatPillProps>(({ value, label }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200/60 bg-white px-4 py-3">
      <div className="text-xl font-semibold">{value ?? 0}</div>
      <div className="text-xs text-neutral-500 text-center">{label}</div>
    </div>
  );
});

StatPill.displayName = 'StatPill';