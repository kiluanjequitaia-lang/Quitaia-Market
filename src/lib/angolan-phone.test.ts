import { describe, expect, it } from 'vitest';
import { normalizeAngolanPhone, toWhatsAppDigits } from './angolan-phone';

describe('Angolan phone numbers', () => {
  it('accepts E.164 numbers', () => expect(normalizeAngolanPhone('+244923456789')).toBe('+244923456789'));
  it('adds the Angola country code to a local nine-digit number', () => expect(normalizeAngolanPhone('923 456 789')).toBe('+244923456789'));
  it('normalises spaces, hyphens and parentheses', () => expect(normalizeAngolanPhone('+244 (923) 456-789')).toBe('+244923456789'));
  it('rejects wrong country codes and wrong digit counts', () => {
    expect(normalizeAngolanPhone('+351923456789')).toBeNull();
    expect(normalizeAngolanPhone('92345678')).toBeNull();
  });
  it('produces WhatsApp digits only for valid numbers', () => {
    expect(toWhatsAppDigits('+244 923 456 789')).toBe('244923456789');
    expect(toWhatsAppDigits('invalid')).toBeNull();
  });
});
