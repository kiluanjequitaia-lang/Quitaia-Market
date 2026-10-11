-- Replace the broad public bucket read policy with a policy tied to product_images.
-- This keeps stored images public only when referenced by an active ad, while owners can
-- continue to manage their own product images through the owner policy in migration 0001.
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read referenced ad images" on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.product_images pi
    join public.products p on p.id = pi.product_id
    where pi.storage_path = name
      and p.status = 'active'
  )
);
