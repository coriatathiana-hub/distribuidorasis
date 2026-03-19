-- Migration: 009_product_categories_pivot
-- Added by: HU-5.3 (FEAT-5)
-- Description: Introduces many-to-many relation between products and categories.
--              Backfills existing products.category_id into product_categories
--              and applies RLS policies aligned with existing admin/anon model.

-- 1) Pre-check: do not continue if legacy data is incompatible.
do $$
begin
  if exists (
    select 1
    from public.products p
    left join public.categories c on c.id = p.category_id
    where p.category_id is null
      or c.id is null
      or c.is_active = false
  ) then
    raise exception
      'HU-5.3 precheck failed: products with orphan or inactive legacy category detected. Migration aborted.';
  end if;
end
$$;

-- 2) Pivot table.
create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create index if not exists idx_product_categories_category_id
  on public.product_categories (category_id);

create index if not exists idx_product_categories_product_id
  on public.product_categories (product_id);

-- 3) Backfill from legacy 1:N column.
insert into public.product_categories (product_id, category_id)
select p.id, p.category_id
from public.products p
where p.category_id is not null
on conflict (product_id, category_id) do nothing;

-- 4) Enable RLS.
alter table public.product_categories enable row level security;

-- Re-runnable policy creation.
drop policy if exists "product_categories_anon_select_active" on public.product_categories;
drop policy if exists "product_categories_admin_all" on public.product_categories;

create policy "product_categories_anon_select_active"
on public.product_categories
for select
to anon
using (
  exists (
    select 1
    from public.products p
    join public.categories c on c.id = product_categories.category_id
    where p.id = product_categories.product_id
      and p.is_active = true
      and c.is_active = true
  )
);

create policy "product_categories_admin_all"
on public.product_categories
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
