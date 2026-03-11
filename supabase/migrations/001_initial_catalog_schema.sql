-- Migration: 001_initial_catalog_schema
-- Added by: HU-2.1 (FEAT-2)
-- Description: Creates base tables for profiles, categories, and products.
--              product_images and contact_requests are scaffolded here to
--              receive their own RLS/storage policies in FEAT-3 and FEAT-4.

create extension if not exists "pgcrypto";

-- profiles: one row per admin user, linked to auth.users by the same UUID.
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        unique not null,
  role        text        not null check (role in ('admin')),
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- categories: top-level product groupings shown in catalog filters.
create table if not exists public.categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        unique not null,
  slug        text        unique not null,
  sort_order  int         not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- products: main catalog entity; belongs to one category.
create table if not exists public.products (
  id                 uuid        primary key default gen_random_uuid(),
  category_id        uuid        not null references public.categories(id) on delete restrict,
  name               text        not null,
  slug               text        unique not null,
  short_description  text,
  description        text,
  specs_json         jsonb       not null default '{}'::jsonb,
  is_active          boolean     not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- product_images: multiple ordered images per product (FEAT-3 completes policies/storage).
create table if not exists public.product_images (
  id            uuid        primary key default gen_random_uuid(),
  product_id    uuid        not null references public.products(id) on delete cascade,
  storage_path  text        not null,
  public_url    text        not null,
  alt_text      text,
  sort_order    int         not null default 0,
  is_cover      boolean     not null default false,
  created_at    timestamptz not null default now()
);

-- contact_requests: lead capture from public contact form (FEAT-4 adds email dispatch).
create table if not exists public.contact_requests (
  id            uuid        primary key default gen_random_uuid(),
  full_name     text        not null,
  company       text,
  phone         text        not null,
  email         text        not null,
  request_type  text        not null,
  message       text        not null,
  source        text        not null default 'web_form',
  status        text        not null default 'new',
  created_at    timestamptz not null default now()
);

-- Trigger: auto-update products.updated_at on row change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();
