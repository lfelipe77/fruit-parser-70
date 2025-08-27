/**
 * CPF validation utilities for Ganhavel PIX flow
 * Provides strict validation with dev-safe testing options
 */

export function onlyDigits(input: string): string {
  return (input ?? '').replace(/\D/g, '');
}

export function isValidCPF(raw: string): boolean {
  const cpf = onlyDigits(raw);
  
  // Must be exactly 11 digits
  if (cpf.length !== 11) return false;
  
  // Reject repeated digits (111.111.111-11, 222.222.222-22, etc.)
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) firstDigit = 0;
  if (firstDigit !== parseInt(cpf[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) secondDigit = 0;
  if (secondDigit !== parseInt(cpf[10])) return false;
  
  return true;
}

export function normalizeCPFForAsaas(raw: string): string {
  const digits = onlyDigits(raw);
  
  if (!isValidCPF(digits)) {
    throw new Error('CPF inválido. Verifique e tente novamente.');
  }
  
  return digits;
}

export function tryNormalizeCPF(raw: string): string | null {
  try {
    return normalizeCPFForAsaas(raw);
  } catch {
    return null;
  }
}

// Known valid sandbox CPFs for testing
export const VALID_SANDBOX_CPFS = [
  '52998224725',
  '15350946056', 
  '11144477735'
];

// Check if CPF is in our known valid test list
export function isTestCPF(cpf: string): boolean {
  const digits = onlyDigits(cpf);
  return VALID_SANDBOX_CPFS.includes(digits);
}