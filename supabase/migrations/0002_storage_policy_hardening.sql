-- Public category reads are required for visitors browsing without an account.
drop policy if exists "categories visible" on public.categories;
create policy "categories visible" on public.categories for select to anon, authenticated using (is_active = true);

-- Use a private bucket: public object URLs would bypass row-level access policies.
update storage.buckets set public = false where id = 'product-images';
drop policy if exists "Public read product images" on storage.objects;
drop policy if exists "Public read referenced ad images" on storage.objects;
drop policy if exists "Owner read product images" on storage.objects;
create policy "Owner read product images" on storage.objects
for select to authenticated
using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Public read referenced ad images" on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.product_images pi
    join public.products p on p.id = pi.product_id
    where pi.storage_path = name and p.status = 'active'
  )
);

-- Add the opt-in contact field when upgrading an already-created database.
alter table public.products add column if not exists whatsapp_phone text;
alter table public.products drop constraint if exists products_whatsapp_phone_format;
alter table public.products add constraint products_whatsapp_phone_format check (whatsapp_phone is null or whatsapp_phone ~ '^[+]244[0-9]{9}$');
