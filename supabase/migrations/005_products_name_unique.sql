-- Migration: 005_products_name_unique.sql
-- Added by: HU-2.3 (FEAT-2) — fix found during manual testing
-- Description: Adds UNIQUE constraint on products.name.
--              categories.name already had UNIQUE since migration 001.
--
-- PREREQUISITE: Remove duplicate product names before running this migration.
--   Identify duplicates:
--     select name, count(*) from products group by name having count(*) > 1;
--   Delete keeping the newest:
--     delete from products
--     where id in (
--       select id from (
--         select id, row_number() over (partition by name order by created_at desc) as rn
--         from products
--       ) t where rn > 1
--     );

alter table public.products
  add constraint products_name_key unique (name);
