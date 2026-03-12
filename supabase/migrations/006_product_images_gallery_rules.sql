-- Migration: 006_product_images_gallery_rules
-- Added by: HU-3.1 (FEAT-3)
-- Description: Enforces gallery business rules for product_images:
--   1. Defensive check constraints for data quality (sort_order >= 0, non-empty URLs/paths).
--   2. Unique sort slot per product for deterministic ordered retrieval.
--   3. Single cover image per product via partial unique index.

-- ── Step 0: Normalize existing sort_orders to be unique per product ─────────────
-- Reassigns sort_order based on creation order so the unique index below can be
-- created safely even if seed/test data has duplicate sort_orders.
with ranked as (
  select
    id,
    row_number() over (partition by product_id order by created_at) - 1 as new_order
  from public.product_images
)
update public.product_images pi
set sort_order = ranked.new_order
from ranked
where pi.id = ranked.id;

-- ── 1. Defensive check constraints ──────────────────────────────────────────────
alter table public.product_images
  add constraint product_images_sort_order_non_negative
  check (sort_order >= 0);

alter table public.product_images
  add constraint product_images_public_url_not_empty
  check (length(trim(public_url)) > 0);

alter table public.product_images
  add constraint product_images_storage_path_not_empty
  check (length(trim(storage_path)) > 0);

-- ── 2. Unique sort slot per product ─────────────────────────────────────────────
-- Guarantees deterministic ordering: each (product_id, sort_order) pair is unique.
-- The admin DAL must manage sort_order values to avoid conflicts on insert/update.
create unique index if not exists product_images_product_sort_order_unique
  on public.product_images(product_id, sort_order);

-- ── 3. At most one cover image per product ───────────────────────────────────────
-- Partial index: only rows with is_cover = true are indexed.
-- setProductImageCover() in the admin DAL must first clear all covers (is_cover=false)
-- before setting the new one (is_cover=true) to avoid a transient conflict.
create unique index if not exists product_images_single_cover_per_product
  on public.product_images(product_id)
  where is_cover = true;

-- ── Storage bucket reference (manual step) ───────────────────────────────────────
-- Bucket: products
-- Public read: enabled (all authenticated and anonymous users can read image URLs).
-- Write (upload / delete): authenticated admin only.
-- See docs/SETUP.md § 5.1 for policy details.
