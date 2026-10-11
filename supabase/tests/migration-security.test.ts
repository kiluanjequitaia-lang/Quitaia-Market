import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration1 = readFileSync(new URL('../migrations/0001_marketplace_phase1.sql', import.meta.url), 'utf8');
const migration2 = readFileSync(new URL('../migrations/0002_storage_policy_hardening.sql', import.meta.url), 'utf8');
const migration3 = readFileSync(new URL('../migrations/0003_product_category_guardrails.sql', import.meta.url), 'utf8');
const seed = readFileSync(new URL('../seed.sql', import.meta.url), 'utf8');

describe('Supabase migration safety invariants', () => {
  it('enables RLS on all app-owned tables', () => {
    for (const table of ['profiles', 'stores', 'categories', 'products', 'product_images', 'product_variants']) {
      expect(migration1).toContain('alter table public.' + table + ' enable row level security');
    }
  });

  it('keeps product photos in a private bucket with a strict size limit', () => {
    expect(migration1).toContain("values('product-images','product-images',false,5242880");
    expect(migration2).toContain("update storage.buckets set public = false where id = 'product-images'");
    expect(migration2).toContain("where pi.storage_path = name and p.status = 'active'");
    expect(migration2).not.toContain('create policy "Public read product images"');
  });

  it('validates an optional Angolan WhatsApp number in both schema and upgrade migration', () => {
    expect(migration1).toContain("whatsapp_phone ~ '^[+]244[0-9]{9}$'");
    expect(migration2).toContain("whatsapp_phone ~ '^[+]244[0-9]{9}$'");
  });

  it('prevents active ads from using inactive categories', () => {
    expect(migration3).toContain('products_validate_category');
    expect(migration3).toContain("new.status = 'active'");
    expect(migration3).toContain("where c.id = category_id and c.is_active = true");
  });

  it('seeds categories only, never fictitious product listings', () => {
    expect(seed).toContain('insert into public.categories');
    expect(seed).not.toMatch(/insert\s+into\s+public\.products/i);
  });
});
