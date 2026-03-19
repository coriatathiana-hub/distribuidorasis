# ADR-HU-5.3: Multi-category model migration for products

## Status
Accepted

## Context

`HU-5.3` requires evolving the catalog model from a single category relationship
(`products.category_id`) to a many-to-many relationship so a product can appear
in multiple public filters without duplicating records.

Current risks:
- Breaking existing reads in public and admin catalog services.
- Data loss during migration from `products.category_id`.
- RLS policy regressions if the pivot table is not protected.
- Duplicate category assignments for the same product.

## Decision

1. Create a new pivot table `product_categories` with:
   - `product_id` FK to `products(id)` with `ON DELETE CASCADE`
   - `category_id` FK to `categories(id)` with `ON DELETE RESTRICT`
   - unique constraint on (`product_id`, `category_id`)
2. Backfill `product_categories` from current `products.category_id`.
3. Keep `products.category_id` only as a temporary compatibility column during HU-5.3 implementation.
4. Update DAL reads/writes to use `product_categories` as source of truth.
5. Update public filters and product detail queries to aggregate categories.
6. Add RLS policies on `product_categories` aligned with existing admin/anon access patterns.
7. Drop `products.category_id` in a final migration once all consumers have been switched.

## Alternatives Considered

### Alternative A: Store category IDs in `products.specs_json`
Rejected due to weak referential integrity and harder filtering/indexing.

### Alternative B: Keep 1:N and duplicate products by category
Rejected due to content duplication, inconsistent inventory presentation, and poor admin UX.

## Consequences

### Positive
- Better taxonomy and discoverability in public catalog.
- Normalized model with explicit relationships and no duplicated products.
- Enables future weighting/prioritization per category assignment.

### Negative
- Migration complexity across SQL, DAL types, and UI forms.
- Temporary compatibility period while both representations coexist.

## Sequence (High-level)

1. Migration creates `product_categories`, constraints, indexes, and RLS.
2. Backfill script inserts one row per existing `products.category_id`.
3. DAL switches create/update flows to write pivot records transactionally.
4. Public/admin reads consume pivot joins.
5. Tests validate migration integrity, multi-category CRUD, and filters.
6. Cleanup migration drops `products.category_id` after verification.
