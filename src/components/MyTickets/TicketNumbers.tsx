import { toFiveSingles, formatFiveSingles } from '@/lib/numberFormat';

interface TicketNumbersProps {
  purchased_numbers: unknown;
}

export function TicketNumbers({ purchased_numbers }: TicketNumbersProps) {
  // can be a combo (multiple tickets) or a single one
  const combos: unknown[] =
    Array.isArray(purchased_numbers) && purchased_numbers.length &&
    Array.isArray(purchased_numbers[0])
      ? (purchased_numbers as unknown[])                   // [[...],[...],...]
      : [purchased_numbers];                               // [...]

  return (
    <div className="space-y-2">
      {combos.map((c, i) => {
        const singles = toFiveSingles(c);
        return (
          <input
            key={i}
            readOnly
            value={`(${formatFiveSingles(singles)})`}
            className="w-full rounded-md border px-3 py-2 font-mono text-sm bg-muted"
          />
        );
      })}
    </div>
  );
}