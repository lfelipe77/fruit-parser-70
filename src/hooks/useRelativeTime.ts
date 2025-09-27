import { useEffect, useMemo, useState } from "react";

export function useRelativeTime(iso?: string | null, locale: string = "pt-BR") {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Only start timer if we have a valid ISO date
    if (!iso) return;
    
    const id = setInterval(() => setNow(Date.now()), 60_000); // update every 1 minute
    return () => clearInterval(id);
  }, [iso]);

  return useMemo(() => {
    if (!iso) return "—";
    const dt = new Date(iso).getTime();
    if (Number.isNaN(dt)) return "—";

    const diffSec = Math.floor((now - dt) / 1000);
    if (diffSec < 60) return "agora";

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return rtf.format(-mins, "minute"); // "há 5 minutos"

    const hours = Math.floor(mins / 60);
    if (hours < 24) return rtf.format(-hours, "hour"); // "há 3 horas"

    const days = Math.floor(hours / 24);
    return rtf.format(-days, "day"); // "há 2 dias"
  }, [iso, now, locale]);
}