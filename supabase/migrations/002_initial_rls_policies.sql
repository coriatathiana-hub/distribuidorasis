-- Migration: 002_initial_rls_policies
-- Added by: HU-2.1 (FEAT-2)
-- Description: Enables RLS on all catalog tables and applies initial access policies.
--              anon role: read-only on active catalog data, insert-only on contact_requests.
--              authenticated admin role: full CRUD gated by profiles.role='admin' and is_active=true.

-- Enable RLS on all tables
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_images  enable row level security;
alter table public.contact_requests enable row level security;

-- ============================================================
-- profiles
-- ============================================================
-- anon: no access (table hidden from public)
-- authenticated admin: select own row and update is_active only
create policy "profiles_admin_select"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

create policy "profiles_admin_update"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

-- ============================================================
-- categories
-- ============================================================
create policy "categories_anon_select_active"
on public.categories
for select
to anon
using (is_active = true);

create policy "categories_admin_all"
on public.categories
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

-- ============================================================
-- products
-- ============================================================
create policy "products_anon_select_active"
on public.products
for select
to anon
using (is_active = true);

create policy "products_admin_all"
on public.products
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

-- ============================================================
-- product_images (full policies completed in FEAT-3)
-- ============================================================
create policy "product_images_anon_select"
on public.product_images
for select
to anon
using (true);

create policy "product_images_admin_all"
on public.product_images
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

-- ============================================================
-- contact_requests (FEAT-4 adds email dispatch; policy base here)
-- ============================================================
create policy "contact_requests_anon_insert"
on public.contact_requests
for insert
to anon
with check (true);

create policy "contact_requests_admin_all"
on public.contact_requests
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);
