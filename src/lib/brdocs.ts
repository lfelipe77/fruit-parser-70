// src/lib/brdocs.ts
export function onlyDigits(v?: string | null): string { 
  return (v ?? '').replace(/\D+/g, ''); 
}

export function isValidCPF(raw?: string | null): boolean {
  const v = onlyDigits(raw);
  if (v.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(v)) return false;
  let s = 0; for (let i = 0; i < 9; i++) s += Number(v[i]) * (10 - i);
  let d1 = (s * 10) % 11; if (d1 === 10) d1 = 0; if (d1 !== Number(v[9])) return false;
  s = 0; for (let i = 0; i < 10; i++) s += Number(v[i]) * (11 - i);
  let d2 = (s * 10) % 11; if (d2 === 10) d2 = 0; return d2 === Number(v[10]);
}

export function isValidCNPJ(raw?: string | null): boolean {
  const v = onlyDigits(raw);
  if (v.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(v)) return false;
  const calc = (len: number) => {
    const w = len === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    let s = 0; for (let i = 0; i < w.length; i++) s += Number(v[i]) * w[i];
    const m = s % 11; return m < 2 ? 0 : 11 - m;
  };
  const d1 = calc(12); if (d1 !== Number(v[12])) return false;
  const d2 = calc(13); return d2 === Number(v[13]);
}

export type PersonType = "FISICA" | "JURIDICA";

export function normalizeCpfCnpjOrNull(raw?: string | null): { digits: string; type: PersonType } | null {
  const cleaned = onlyDigits((raw ?? '').trim());
  if (!cleaned) return null;
  if (isValidCPF(cleaned))  return { digits: cleaned, type: "FISICA" };
  if (isValidCNPJ(cleaned)) return { digits: cleaned, type: "JURIDICA" };
  return null;
}