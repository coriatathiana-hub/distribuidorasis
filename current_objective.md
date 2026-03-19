# Objective: HU-5.2 — Diferir eliminacion fisica de imagenes en edicion de producto hasta accion explicita de guardar

## Context
- **Feature:** FEAT-5 — Hardening post-MVP de conversion, edicion y taxonomia de catalogo
- **Story:** Como operador de catalogo, quiero que borrar una imagen durante la edicion solo marque el cambio localmente, para poder evitar perdida accidental de contenido antes de confirmar el formulario.
- **Spec Level:** Standard
- **Git Strategy:** `feature` (from `.spec/config.md`)
- **Feature Branch:** `feat/5`
- **Objective Branch:** `hu/5.2`
- **TDD Mode:** `flexible` (`IMPLEMENT → TEST → REFACTOR`)

## Validation (Step 0)

- **Status:** WARNINGS (no BLOCKER)
- **Summary:**
  - ✅ PRD and TECH_SPEC satisfy global pre-requisites.
  - ✅ FEAT-5 and HU-5.2 exist with valid SAFe IDs.
  - ✅ HU-5.2 in `.spec/work/FEAT-5/README.md` includes C/Q/P + >=2 BDD + >=1 exception scenario.
  - ⚠️ `docs/PRD.md` does not yet include FEAT-5 explicitly.
  - ⚠️ `docs/BACKLOG.md` keeps initial criteria; formal BDD is maintained in `.spec/work/FEAT-5/README.md`.
  - ⚠️ `current_objective.md` had no active objective before this command (expected).
- **Evidence:** `.spec/history/2026-03-18_HU-5.2_validation.md`
- **Decision:** Proceed to planning (allowed by Poka-Yoke because there is no BLOCKER).

## Acceptance Criteria (BDD)

- **Dado que** el admin abre la edicion de un producto con imagenes existentes, **cuando** marca una imagen para eliminar pero no guarda, **entonces** la imagen sigue persistida en BD/Storage.
- **Dado que** el admin tiene cambios pendientes de eliminacion y presiona `Guardar`, **cuando** la transaccion finaliza exitosamente, **entonces** solo en ese momento se eliminan de forma fisica las imagenes confirmadas.
- **Escenario de excepcion:** Si falla la eliminacion fisica en Storage despues de guardar metadatos, se debe aplicar rollback o marcar inconsistencia recuperable con alerta para reintento.

## Story Analysis

- **Data changes:** No schema migration expected for HU-5.2.
- **Infrastructure prerequisites:** None new expected; reuse current Supabase DB + Storage setup.
- **Component classification:**
  - Deferred gallery interactions and pending-state UX: `[CC]`
  - Persistence orchestration for confirm-on-save flow: `[DAL]`
  - Regression and interaction scenarios for no-save behavior: `[TEST]`
- **Dependencies:** Builds on HU-3.2 gallery CRUD and HU-2.3 product edit dialog behavior.
- **Risk areas:**
  - Inconsistent local-vs-server state if dialog closes with pending operations.
  - Partial persistence if DB/storage operations fail mid-commit.
  - Regressions in existing flows that currently persist immediately.

### Current Behavior Observed (actions that run without pressing product `Guardar`)
- In `ImageGalleryManager`, the following actions currently persist immediately:
  - `uploadProductImage(...)` on file selection.
  - `deleteProductImage(...)` on image delete click.
  - `setProductImageCover(...)` on cover toggle click.
  - `batchUpdateSortOrder(...)` when pressing gallery-level `Guardar orden`.
- Outside the dialog save, product-level table actions also persist immediately (`toggleProductActive`, `deleteProduct`), but they are out-of-scope for HU-5.2.

## Implementation Plan

### Task 1: Add regression-first coverage for deferred delete contract (~55 min)
- **Type:** [TEST]
- **Cycle:** IMPLEMENT → TEST → REFACTOR
- **Files:** `app/src/test/product-manager-edit-gallery-deferred-delete.test.tsx` (new), optional adjustments in `app/src/test/admin-catalog-service.test.ts`
- **Verification:** `npm run test -- src/test/product-manager-edit-gallery-deferred-delete.test.tsx`
- **Status:** ✅ Completed (new integration tests covering no-save/no-delete + save-commit path)

### Task 2: Refactor gallery editing to draft/pending mode (no immediate physical delete) (~55 min)
- **Type:** [CC]
- **Cycle:** IMPLEMENT → TEST → REFACTOR
- **Files:** `app/src/components/admin/ImageGalleryManager.tsx`
- **Verification:** `npm run test -- src/test/product-manager-edit-gallery-deferred-delete.test.tsx`
- **Status:** ✅ Completed (delete action now marks pending; summary + undo added)

### Task 3: Wire Product dialog Save/Cancel to commit or discard pending gallery operations (~55 min)
- **Type:** [CC]
- **Cycle:** IMPLEMENT → TEST → REFACTOR
- **Files:** `app/src/components/admin/ProductManager.tsx`, `app/src/components/admin/ImageGalleryManager.tsx`
- **Verification:** `npm run test -- src/test/product-manager-edit-gallery-deferred-delete.test.tsx src/test/admin-layout-routes.test.tsx`
- **Status:** ✅ Completed (dialog save now commits deferred deletions through gallery ref handle)

### Task 4: Implement robust commit pipeline for deferred gallery mutations (~55 min)
- **Type:** [DAL]
- **Cycle:** IMPLEMENT → TEST → REFACTOR
- **Files:** `app/src/lib/api/admin-catalog-service.ts`, `app/src/components/admin/ImageGalleryManager.tsx`
- **Verification:** `npm run test -- src/test/admin-catalog-service.test.ts src/test/product-manager-edit-gallery-deferred-delete.test.tsx`
- **Status:** ✅ Completed (sequential delete + post-delete sort normalization + recoverable error path)

### Task 5: Add exception-path handling and user feedback for failed commit actions (~45 min)
- **Type:** [CC]
- **Cycle:** IMPLEMENT → TEST → REFACTOR
- **Files:** `app/src/components/admin/ImageGalleryManager.tsx`, `app/src/components/admin/ProductManager.tsx`
- **Verification:** `npm run test -- src/test/product-manager-edit-gallery-deferred-delete.test.tsx`
- **Status:** ✅ Completed (explicit pending-delete messaging and commit failure feedback)

### Task 6: Integrated verification + documentation notes for closure readiness (~30 min)
- **Type:** [TEST]
- **Cycle:** IMPLEMENT → TEST → REFACTOR
- **Files:** `current_objective.md`, optional `docs/SETUP.md` (only if infra behavior changes)
- **Verification:** `npm run test -- src/test/product-manager-edit-gallery-deferred-delete.test.tsx src/test/admin-catalog-service.test.ts src/test/admin-layout-routes.test.tsx`
- **Status:** ✅ Completed (integrated suites passing + lints clean on touched files)

## Execution Log
- `npm run test -- src/test/admin-image-gallery-manager.test.tsx src/test/product-manager-edit-gallery-deferred-delete.test.tsx src/test/admin-products-persistence.test.tsx` ✅
- `npm run test -- src/test/product-manager-edit-gallery-deferred-delete.test.tsx src/test/admin-catalog-service.test.ts src/test/admin-layout-routes.test.tsx` ✅
- `ReadLints` on touched files ✅ (no new lint issues)

## Database Changes (if applicable)

No DB schema changes planned for HU-5.2.

## Manual Testing Checklist
- [ ] Abrir edición de producto existente y eliminar una imagen; cerrar con `Cancelar` y confirmar que la imagen sigue visible tras recargar.
- [ ] Eliminar una imagen y hacer cambios en texto; presionar `Guardar cambios` y confirmar borrado físico/persistencia final.
- [ ] Repetir flujo con varias imágenes (incluyendo portada) y validar consistencia de orden y portada final.
- [ ] Simular falla de commit (network/storage) y confirmar feedback recuperable + ausencia de pérdida silenciosa.
- [ ] Verificar que acciones fuera de HU-5.2 (activar/desactivar producto, borrar producto desde tabla) no cambian su comportamiento actual.

## Definition of Done
- [x] All BDD criteria have passing tests
- [x] No TypeScript errors
- [ ] RLS policies tested (if applicable)
- [ ] CHANGELOG entry drafted
- [ ] All changes committed with `feat(HU-5.2):` convention
- [ ] Tag `HU-5.2` created
