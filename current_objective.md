# Objective: HU-1.2 — Catalogo responsive con busqueda, filtros y estados UX

## Context

- **Feature:** FEAT-1 — Foundation mobile-first de catalogo y navegacion
- **Story:** Como comprador que evalua alternativas de producto, quiero buscar por nombre y filtrar por categoria desde mobile o desktop, para poder reducir tiempo de descubrimiento de productos relevantes.
- **Spec Level:** Lite
- **TDD Mode:** flexible
- **Git Strategy:** trunk (work continues on `main`)
- **Estimated Duration:** 3h 00m
- **Execution Time Tracking:** Para esta HU, el tiempo real se registrara como ventana operativa desde este `@start-objective` hasta `@finish-objective` (apoyado por timestamps de chat + commits), no solo diferencia entre commits.

## Validation Report (Step 0)

### Target: HU-1.2 — Catalogo responsive con busqueda, filtros y estados UX

- ✅ `PRD.md`: Vision, usuarios, alcance y KPIs disponibles para FEAT-1.
- ✅ `TECH_SPEC.md`: Stack y restricciones tecnicas alineadas con trabajo en `app/`.
- ✅ `FEAT-1`: Hipotesis y HU-1.2 definidas con criterios BDD y escenario de error.
- ✅ `current_objective.md`: sin objetivo activo previo.
- ⚠️ `docs/BACKLOG.md`: la seccion global `Completed` sigue vacia (no bloquea HU-1.2 porque HU-1.1 se marca completada dentro de FEAT-1 y su historial existe en `.spec/history`).

**RESULT:** WARNINGS  
**ACTION:** Se puede continuar; no hay BLOCKERS para planificar HU-1.2.

## Acceptance Criteria (BDD)

### Scenario 1: Busqueda por texto

- **Dado que:** Existen productos activos en el catalogo.
- **Cuando:** Ingreso un termino de busqueda.
- **Entonces:** Deben mostrarse solo productos que coincidan con nombre o descripcion corta.

### Scenario 2: Filtro por categoria

- **Dado que:** Hay categorias disponibles.
- **Cuando:** Selecciono una categoria.
- **Entonces:** El listado debe actualizarse solo con productos de esa categoria y mostrar contador de resultados.

### Scenario 3: Sin resultados

- **Dado que:** Aplico una busqueda o filtro sin coincidencias.
- **Cuando:** El sistema procesa el criterio.
- **Entonces:** Debe mostrar estado vacio con mensaje claro y accion para limpiar filtros.

## Implementation Plan

### Task 1: Auditar Catalogo y mapear criterios HU-1.2 a componentes existentes (~30 min) ✅

- **Type:** [CC]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/pages/Catalogo.tsx`, `app/src/components/ProductFilters.tsx`
- **Verification:** `cd app && npm test`

### Task 2: Refactorizar logica de filtrado/busqueda para consistencia y legibilidad (~45 min) ✅

- **Type:** [CC]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/lib/catalog-service.ts`, `app/src/pages/Catalogo.tsx`
- **Verification:** `cd app && npm test`

### Task 3: Mejorar UX de filtros (acciones de limpieza y feedback de resultados) (~40 min) ✅

- **Type:** [CC]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/components/ProductFilters.tsx`, `app/src/pages/Catalogo.tsx`
- **Verification:** `cd app && npm test`

### Task 4: Fortalecer estados de interfaz para catalogo (loading/empty state responsive) (~45 min) ✅

- **Type:** [CC]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/pages/Catalogo.tsx`
- **Verification:** `cd app && npm test`

### Task 5: Agregar pruebas de HU-1.2 (busqueda, categoria, no resultados y reset) (~50 min) ✅

- **Type:** [TEST]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/test/catalogo-filters.test.tsx`, `app/src/test/setup.ts`
- **Verification:** `cd app && npm test`

## Infrastructure Changes

- **New environment variables:** None
- **New external services:** None
- **New storage/buckets:** None
- **New auth configuration:** None
- **SETUP.md update required:** No

## Manual Testing Checklist

- [ ] En mobile (390x844), escribir terminos en busqueda y validar filtrado inmediato del grid.
- [ ] Cambiar categoria y verificar que el contador coincide con productos visibles.
- [ ] Forzar escenario sin resultados y confirmar estado vacio con accion para limpiar filtros.
- [ ] Limpiar filtros y confirmar retorno al listado completo sin recargar pagina.

## Definition of Done

- [x] All BDD criteria have passing tests
- [x] No TypeScript errors
- [x] RLS policies tested (if applicable) — N/A para HU de catalogo sin BD activa
- [ ] Manual testing checklist verified
- [ ] CHANGELOG entry drafted
- [ ] All changes committed with `feat(HU-1.2):` convention
- [ ] Tag `HU-1.2` created
