create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 phone text,
 avatar_url text,
 city text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.stores (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null unique references auth.users(id) on delete cascade,
 name text not null,
 description text,
 logo_url text,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.categories (
 id text primary key,
 name text not null,
 icon text,
 position integer not null default 0,
 is_active boolean not null default true
);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 seller_id uuid not null references auth.users(id) on delete cascade,
 category_id text not null references public.categories(id),
 title text not null check (char_length(trim(title)) between 3 and 100),
 description text check (description is null or char_length(description) <= 3000),
 price numeric(14,2) not null check (price > 0),
 currency text not null default 'AOA' check (currency = 'AOA'),
 city text,
 status text not null default 'active' check (status in ('active','paused','sold','deleted')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.product_images (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 storage_path text not null unique,
 position smallint not null check (position between 0 and 8),
 created_at timestamptz not null default now(),
 unique(product_id,position)
);
create table if not exists public.product_variants (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 name text not null,
 value text not null,
 created_at timestamptz not null default now()
);
create index if not exists products_active_created_idx on public.products(status,created_at desc);
create index if not exists products_seller_created_idx on public.products(seller_id,created_at desc);
create index if not exists products_category_idx on public.products(category_id,status);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$ begin insert into public.profiles(id,phone) values(new.id,new.phone) on conflict(id) do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "categories visible" on public.categories;
create policy "categories visible" on public.categories for select to authenticated using (is_active = true);
drop policy if exists "stores public active read" on public.stores;
create policy "stores public active read" on public.stores for select to anon, authenticated using (is_active = true);
drop policy if exists "stores owner manage" on public.stores;
create policy "stores owner manage" on public.stores for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "products public active read" on public.products;
create policy "products public active read" on public.products for select to anon, authenticated using (status = 'active');
drop policy if exists "products owner read all" on public.products;
create policy "products owner read all" on public.products for select to authenticated using (auth.uid() = seller_id);
drop policy if exists "products owner insert" on public.products;
create policy "products owner insert" on public.products for insert to authenticated with check (auth.uid() = seller_id);
drop policy if exists "products owner update" on public.products;
create policy "products owner update" on public.products for update to authenticated using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists "product images active read" on public.product_images;
create policy "product images active read" on public.product_images for select to anon, authenticated using (exists(select 1 from public.products p where p.id=product_id and p.status='active'));
drop policy if exists "product images owner manage" on public.product_images;
create policy "product images owner manage" on public.product_images for all to authenticated using (exists(select 1 from public.products p where p.id=product_id and p.seller_id=auth.uid())) with check (exists(select 1 from public.products p where p.id=product_id and p.seller_id=auth.uid()));

drop policy if exists "variants active read" on public.product_variants;
create policy "variants active read" on public.product_variants for select to anon, authenticated using (exists(select 1 from public.products p where p.id=product_id and p.status='active'));
drop policy if exists "variants owner manage" on public.product_variants;
create policy "variants owner manage" on public.product_variants for all to authenticated using (exists(select 1 from public.products p where p.id=product_id and p.seller_id=auth.uid())) with check (exists(select 1 from public.products p where p.id=product_id and p.seller_id=auth.uid()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects for select to anon,authenticated using(bucket_id='product-images');
drop policy if exists "Owner upload product images" on storage.objects;
create policy "Owner upload product images" on storage.objects for insert to authenticated with check(bucket_id='product-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Owner update product images" on storage.objects;
create policy "Owner update product images" on storage.objects for update to authenticated using(bucket_id='product-images' and (storage.foldername(name))[1] = auth.uid()::text) with check(bucket_id='product-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Owner delete product images" on storage.objects;
create policy "Owner delete product images" on storage.objects for delete to authenticated using(bucket_id='product-images' and (storage.foldername(name))[1] = auth.uid()::text);

