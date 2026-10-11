-- Private user reports for marketplace safety.
create table if not exists public.product_reports (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 reporter_id uuid not null references auth.users(id) on delete cascade,
 reason text not null check (reason in ('false_information','suspected_fraud','prohibited_item','offensive_content','other')),
 details text check (details is null or char_length(details) <= 1500),
 status text not null default 'pending' check (status in ('pending','reviewing','resolved','dismissed')),
 created_at timestamptz not null default now(),
 unique(product_id, reporter_id)
);

create index if not exists product_reports_status_created_idx
 on public.product_reports(status, created_at desc);
create index if not exists product_reports_product_idx
 on public.product_reports(product_id);

alter table public.product_reports enable row level security;

drop policy if exists "reporters read own reports" on public.product_reports;
create policy "reporters read own reports"
 on public.product_reports
 for select to authenticated
 using (auth.uid() = reporter_id);

drop policy if exists "authenticated users report active other listings" on public.product_reports;
create policy "authenticated users report active other listings"
 on public.product_reports
 for insert to authenticated
 with check (
  auth.uid() = reporter_id
  and exists (
   select 1
   from public.products p
   where p.id = product_id
    and p.status = 'active'
    and p.seller_id <> auth.uid()
  )
 );

grant select, insert on public.product_reports to authenticated;
