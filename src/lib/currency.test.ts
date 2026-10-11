import { describe, expect, it } from 'vitest';
import { formatKz } from './currency';

describe('formatKz', () => {
  it('uses dot thousand separators, comma decimals, and Kz suffix', () => {
    expect(formatKz(24999)).toBe('24.999,00 Kz');
  });

  it('keeps exactly two decimal places', () => {
    expect(formatKz(1234.5)).toBe('1.234,50 Kz');
  });

  it('supports small values without losing decimal precision', () => {
    expect(formatKz(0.5)).toBe('0,50 Kz');
  });
});
