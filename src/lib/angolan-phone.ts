export function normalizeAngolanPhone(value: string): string | null {
  const compact = value.trim().replace(/[\\s()-]/g, '');
  if (/^\\+244\\d{9}$/.test(compact)) return compact;
  if (/^\\d{9}$/.test(compact)) return '+244' + compact;
  return null;
}

export function toWhatsAppDigits(value: string): string | null {
  const normalized = normalizeAngolanPhone(value);
  return normalized ? normalized.replace(/\\D/g, '') : null;
}
