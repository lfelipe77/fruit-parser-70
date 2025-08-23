// Returns a Date for the next Wed or Sat at 20:00 BRT, given "now"
export function nextFederalDrawDate(now = new Date()): Date {
  // Always compute in America/Sao_Paulo
  const tz = 'America/Sao_Paulo';

  // helper to get local day/hour in BRT
  const fmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: tz,
    weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  // Build a local date object @ BRT by reconstructing Y-M-D from formatter
  const toLocalParts = (d: Date) => {
    const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
    const [day, month, year] = (parts.day + '-' + parts.month + '-' + parts.year).split('-').map(Number);
    const [hour, minute] = (parts.hour + ':' + parts.minute).split(':').map(Number);
    return { year, month, day, hour, minute };
  };

  const parts = toLocalParts(now);
  // Create a JS date pinned to BRT by using the same wall time and letting it be interpreted in local,
  // then adjust via Intl if needed on display. For scheduling we only care about weekday & time threshold.
  const local = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0);

  // JS: 0=Sun..6=Sat
  let wd = local.getDay();
  const isWed = wd === 3;
  const isSat = wd === 6;

  // function to set to 20:00 same day
  const set20 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 0, 0, 0);

  const at20 = set20(local);
  const before20 = local.getTime() < at20.getTime();

  // If Wed or Sat and before 20:00 -> today 20:00
  if ((isWed || isSat) && before20) return at20;

  // Else advance to next Wed/Sat 20:00
  let days = 1;
  while (true) {
    const n = new Date(local);
    n.setDate(n.getDate() + days);
    const w = n.getDay();
    if (w === 3 || w === 6) return set20(n);
    days++;
  }
}

// Reuse existing dateBR if available; if not:
export function dateBR(d: Date | string | null) {
  if (!d) return "";
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(date);
}