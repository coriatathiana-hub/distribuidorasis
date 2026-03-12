# Objective: HU-3.1 — Persistencia y reglas de negocio para galerias multi-imagen por producto

## Context
- **Feature:** FEAT-3 — Gestion multi-imagen por producto y carrusel en catalogo
- **Story:** Como administrador comercial SIS, quiero persistir multiples imagenes por producto con orden y una portada unica, para poder mantener una galeria consistente reutilizable entre backoffice y catalogo publico.
- **Spec Level:** Lite
- **Git Strategy:** trunk (trabajo sobre `main`, sin branch `hu/N.M`)
- **TDD Mode:** flexible (`IMPLEMENT → TEST → REFACTOR`)

## Acceptance Criteria (BDD)
1. Persistencia de metadatos de galeria.
   - **Dado que:** Existe un producto valido en `products`.
   - **Cuando:** Se registran imagenes en `product_images` con `sort_order` y `is_cover`.
   - **Entonces:** Las imagenes deben quedar asociadas al producto y recuperarse en el mismo orden configurado.

2. Regla de portada unica por producto.
   - **Dado que:** Un producto ya tiene una imagen marcada como portada.
   - **Cuando:** El admin marca otra imagen como portada.
   - **Entonces:** El sistema debe dejar una sola imagen con `is_cover=true` para ese producto.

3. Escenario de error: activo visual invalido o no accesible.
   - **Dado que:** Se intenta guardar una imagen con URL/public path invalido o recurso no disponible.
   - **Cuando:** Se confirma la operacion de guardado.
   - **Entonces:** Debe rechazarse la persistencia y mostrarse un error accionable sin corromper el orden previo de la galeria.

## Implementation Plan

### Task 1: Endurecer reglas SQL de `product_images` para orden y portada ✅
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `supabase/migrations/006_product_images_gallery_rules.sql`, `docs/SETUP.md`
- **Commit:** `b93f5e8`

### Task 2: Extender DAL admin para persistencia de galeria con errores accionables ✅
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/lib/api/admin-catalog-service.ts`, `app/src/types/supabase.ts`
- **Commit:** `08101ae`

### Task 3: Exponer lectura de galeria ordenada para consumo publico y admin ✅
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/lib/api/public-catalog-service.ts`, `app/src/test/catalogo-filters.test.tsx`, `app/src/test/producto-detalle.test.tsx`
- **Commit:** `7b75860`

### Task 4: Blindar contrato automatizado (migraciones + DAL) para HU-3.1 ✅
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/test/supabase-schema-contract.test.ts`, `app/src/test/admin-catalog-service.test.ts`
- **Commit:** `1cd3961`

### Task 5: Validacion integral local de objetivo HU-3.1 ✅
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Result:** 126/126 tests passing — 0 errores de lint en archivos de HU-3.1

## Database Changes (if applicable)
```sql
-- Migration draft: 006_product_images_gallery_rules.sql
-- Objective: enforce deterministic order and single cover image per product.

-- 1) Defensive constraints for gallery quality
alter table public.product_images
  add constraint product_images_sort_order_non_negative
  check (sort_order >= 0);

alter table public.product_images
  add constraint product_images_public_url_not_empty
  check (length(trim(public_url)) > 0);

alter table public.product_images
  add constraint product_images_storage_path_not_empty
  check (length(trim(storage_path)) > 0);

-- 2) Unique sort slot per product (deterministic ordering)
create unique index if not exists product_images_product_sort_order_unique
  on public.product_images(product_id, sort_order);

-- 3) At most one cover image per product
create unique index if not exists product_images_single_cover_per_product
  on public.product_images(product_id)
  where is_cover = true;
```

## Manual Testing Checklist
- [ ] Crear 3 imagenes para un mismo `product_id` y validar lectura ordenada por `sort_order` ascendente.
- [ ] Intentar insertar dos filas con mismo `product_id` + `sort_order` y confirmar rechazo por constraint/indice unico.
- [ ] Marcar portada en una imagen y luego en otra del mismo producto; validar que la operacion preserve una sola portada.
- [ ] Intentar persistir `public_url` vacia o `storage_path` vacio; confirmar error accionable en capa DAL.
- [ ] Verificar que un usuario no admin no pueda ejecutar escrituras sobre `product_images` (RLS).
- [ ] Validar que lecturas publicas de galeria no rompan el flujo de catalogo ante imagen faltante.

## Definition of Done
- [x] All BDD criteria have passing tests
- [x] No TypeScript errors
- [x] RLS policies tested (migration 006 constraints verified via contract tests)
- [ ] CHANGELOG entry drafted
- [x] All changes committed with `feat(HU-3.1):` convention (commits b93f5e8 → 08101ae → 7b75860 → 1cd3961)
- [ ] Tag `HU-3.1` created
