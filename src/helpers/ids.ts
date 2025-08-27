// Helper for CPF/CNPJ validation that's observable, single-source, and permissive

export const onlyDigits = (s?: string | null) => (s ?? '').replace(/\D/g, '');

export function resolveCpfCnpj(opts: {
  profileTaxId?: string | null;
  formDoc?: string | null;
  validateMode?: 'strict' | 'loose'; // loose by default
}) {
  const fromForm = onlyDigits(opts.formDoc);
  const fromProfile = onlyDigits(opts.profileTaxId);
  const chosen = fromForm || fromProfile || '';
  const len = chosen.length;
  const personType = len === 14 ? 'JURIDICA' : 'FISICA'; // fallback FISICA

  console.log('[asaas] cpfCnpj.check', { 
    fromForm, 
    fromProfile, 
    chosen, 
    len, 
    validateMode: opts.validateMode 
  });

  if (opts.validateMode === 'strict') {
    if (!(len === 11 || len === 14)) {
      const err = new Error('Documento inválido. Atualize seu CPF (11) ou CNPJ (14) no perfil (somente números).');
      (err as any).status = 400;
      throw err;
    }
  }
  // loose mode: return whatever we have (may be empty), let Asaas decide
  return { cpfCnpj: chosen, len, personType };
}