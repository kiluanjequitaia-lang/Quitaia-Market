-- Enforce category availability for new/reactivated listings and public discovery.
create or replace function public.validate_product_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.categories c
    where c.id = new.category_id and c.is_active = true
  ) then
    raise exception 'A categoria seleccionada não está disponível.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists products_validate_category on public.products;
create trigger products_validate_category
before insert or update of category_id, status on public.products
for each row
when (new.status = 'active' or tg_op = 'INSERT' or new.category_id is distinct from old.category_id)
execute function public.validate_product_category();

drop policy if exists "products public active read" on public.products;
create policy "products public active read"
on public.products for select to anon, authenticated
using (
  status = 'active'
  and exists (
    select 1 from public.categories c
    where c.id = category_id and c.is_active = true
  )
);

drop policy if exists "products owner insert" on public.products;
create policy "products owner insert"
on public.products for insert to authenticated
with check (
  auth.uid() = seller_id
  and exists (
    select 1 from public.categories c
    where c.id = category_id and c.is_active = true
  )
);

drop policy if exists "products owner update" on public.products;
create policy "products owner update"
on public.products for update to authenticated
using (auth.uid() = seller_id)
with check (
  auth.uid() = seller_id
  and (
    status <> 'active'
    or exists (
      select 1 from public.categories c
      where c.id = category_id and c.is_active = true
    )
  )
);
