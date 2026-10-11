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
