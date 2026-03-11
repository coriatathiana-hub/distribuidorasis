# Objective: HU-2.3 — Persistencia real de categorias y productos en panel admin (sin refactor UX mayor)

## Context

- **Feature:** FEAT-2 — Admin real con Supabase, OTP y seguridad RLS
- **Story:** Como administrador comercial SIS, quiero crear, editar y activar/desactivar categorias/productos con almacenamiento real en Supabase, para poder mantener catalogo actualizado sin perder cambios entre sesiones.
- **Spec Level:** Full
- **TDD Mode:** flexible
- **Git Strategy:** trunk (work continues on `main`)
- **Estimated Duration:** 4h 30m
- **Execution Time Tracking:** Registrar ventana operativa desde `@start-objective` hasta `@finish-objective` con apoyo de timestamps por commit.

## Validation Report (Step 0)

### Target: HU-2.3 — Persistencia real de categorias y productos en panel admin

- ✅ `docs/PRD.md`: FEAT-2 en alcance MVP (admin real con persistencia segura).
- ✅ `docs/TECH_SPEC.md`: stack Supabase + autenticacion OTP + estrategia DAL definidos.
- ✅ `docs/BACKLOG.md`: HU-2.3 existe bajo FEAT-2 con alcance acotado (sin refactor UX mayor).
- ✅ `.spec/work/FEAT-2/README.md`: HU-2.3 definida con BDD actualizado y cierre pendiente RLS autenticado.
- ✅ `current_objective.md`: no existe objetivo activo previo.
- ✅ Dependencias previas listas: HU-2.1 (schema/RLS base), HU-2.2 (auth + guard + sesión admin).
- ⚠️ Prerrequisito operativo: entorno local con Supabase URL/anon key válidos y usuario admin activo en `profiles`.

**RESULT:** PASSED  
**ACTION:** Se puede proceder con planeación e implementación de HU-2.3.

## Acceptance Criteria (BDD)

### Scenario 1: CRUD persistente de catalogo

- **Dado que:** Estoy autenticado como admin.
- **Cuando:** Creo o edito una categoria o producto desde el panel.
- **Entonces:** Los cambios deben guardarse en Supabase y reflejarse en la UI al recargar.

### Scenario 2: Validacion completa de RLS autenticado (cierre pendiente de HU-2.1)

- **Dado que:** Estoy autenticado como admin activo.
- **Cuando:** Ejecuto operaciones de escritura sobre `categories` y `products`.
- **Entonces:** Las operaciones permitidas deben ejecutarse con exito por politicas RLS.

### Scenario 3: Lectura publica consistente del catalogo activo

- **Dado que:** Existen productos activos e inactivos en base real.
- **Cuando:** Un usuario anonimo navega el catalogo publico.
- **Entonces:** Solo debe visualizar productos/categorias activos permitidos por RLS.

### Scenario 4: Error de red o integridad

- **Dado que:** Ocurre una falla de conectividad o validacion de datos.
- **Cuando:** El admin intenta guardar cambios.
- **Entonces:** Debe mostrarse mensaje de error accionable sin perder el estado del formulario.

## Implementation Plan

### ~~Task 1: Implementar servicio DAL real para admin catalog (`categories` + `products`)~~ ✅ DONE
- **Commit:** `d337e18` — `app/src/lib/api/admin-catalog-service.ts` + `slugify` en utils.ts

### ~~Task 2: Refactorizar `CategoryManager` para usar Supabase (list/create/update/toggle)~~ ✅ DONE
- **Commit:** `d337e18` — `app/src/components/admin/CategoryManager.tsx`

### ~~Task 3: Refactorizar `ProductManager` para persistencia real (list/create/update/toggle + filtros)~~ ✅ DONE
- **Commit:** `d337e18` — `app/src/components/admin/ProductManager.tsx`

### ~~Task 4: Integrar estados de carga/error en `/admin` y limpiar mock data~~ ✅ DONE
- **Commit:** `d337e18` — `app/src/pages/Admin.tsx` (mock imports eliminados)

### ~~Task 5: Tests de contrato/componente para Scenarios 1, 2 y 4~~ ✅ DONE
- **Commit:** `d337e18` — 23 tests nuevos, 82 total pasando

### ~~Task 6: Trazabilidad técnica y checklist operativo~~ ✅ DONE
- **Commit:** `d337e18` — `docs/TECH_SPEC.md`, `docs/SETUP.md`

---

### Task 7: Catálogo público conectado a Supabase — Scenario 3 (OMITIDO, completar aquí) (~80 min)

> **Motivo:** Durante `@apply HU-2.3` se implementaron los Scenarios 1, 2 y 4 pero se omitió
> el Scenario 3. El catálogo público (`Catalogo.tsx`, `Producto.tsx`) sigue leyendo del mock
> local (`data/products.ts`), por lo que cambios vía admin no se reflejan en la vista pública.

- **Type:** [DAL] + [CC] + [TEST]
- **Cycle:** IMPLEMENT → TEST → REFACTOR

#### Sub-tarea 7a: `public-catalog-service.ts` [DAL]
- **Archivo nuevo:** `app/src/lib/api/public-catalog-service.ts`
- Exporta: `PublicCategory`, `PublicProduct` (tipos públicos), `listActiveCategories()`, `listActiveProducts()`, `getProductBySlug(slug)`
- Filtra `is_active = true` para usuarios anónimos (RLS lo enforza, la query también)
- Hace join `categories(name)` y `product_images(public_url, is_cover, sort_order)` para incluir imagen de portada

#### Sub-tarea 7b: Actualizar `ProductCard.tsx` [CC]
- **Archivo:** `app/src/components/ProductCard.tsx`
- Cambia tipo de prop de mock `Product` a `PublicProduct`
- Link de `/producto/${product.id}` a `/producto/${product.slug}`
- Usa `cover_image_url` (puede ser null), `category_name`, `short_description`

#### Sub-tarea 7c: Actualizar `ProductFilters.tsx` [CC]
- **Archivo:** `app/src/components/ProductFilters.tsx`
- Elimina import hardcoded de `CATEGORIES`
- Recibe `categories: PublicCategory[]` como prop
- El valor del select usa `cat.id` (para filtrar por `category_id` en Catalogo.tsx)

#### Sub-tarea 7d: Actualizar `Catalogo.tsx` [CC]
- **Archivo:** `app/src/pages/Catalogo.tsx`
- Reemplaza `useMemo(catalogRepository.list(...))` por `useEffect` + `useState`
- Carga categorías y productos activos de Supabase al montar
- Filtrado de búsqueda y categoría permanece client-side (catálogo pequeño)
- Agrega estados de loading y error

#### Sub-tarea 7e: Actualizar `Producto.tsx` [CC]
- **Archivo:** `app/src/pages/Producto.tsx`
- Reemplaza `getProductById(id)` por `getProductBySlug(slug)` vía `useEffect`
- El parámetro de ruta `:id` se interpreta como `slug` (sin cambio de ruta en App.tsx)
- Agrega estados de loading, error y not-found

#### Sub-tarea 7f: Actualizar tests de catálogo [TEST]
- **Archivo:** `app/src/test/catalogo-filters.test.tsx`
- Mock de `@/lib/api/public-catalog-service` con datos representativos
- Actualiza expected counts y categorías al nuevo mock
- Verifica: búsqueda filtra, categoría filtra, estado vacío funciona

- **Verification:** `cd app && npm run test`

## Database Changes (if applicable)

- No nuevas tablas para HU-2.3 (se reutiliza esquema HU-2.1).
- No migraciones estructurales planeadas de inicio.
- En caso de detectar constraint faltante durante implementación, se detiene para acordar migración explícita antes de continuar.
- Validación obligatoria de RLS autenticado sobre `categories` y `products` como cierre del pendiente HU-2.1.

## Infrastructure Changes

- **Auth prerequisite:** sesión admin OTP funcional (HU-2.2).
- **Data prerequisite:** categorías y productos presentes en Supabase (`seed.sql` aplicado).
- **New env vars:** none (se reutilizan `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
- **SETUP.md update required:** Sí, para checklist de validación CRUD autenticado y flujo operativo admin real.

## Risks and Dependencies

- **Dependency:** coherencia entre shape de UI actual y modelo relacional (`categories`/`products`).
- **Risk:** desfase entre filtros UI heredados (mock) y datos reales de Supabase.
- **Risk:** errores de validación SQL (slug/name únicos) que rompan flujo de edición.
- **Risk:** operaciones mutación bloqueadas por RLS si sesión admin expira.
- **Mitigation:** manejo explícito de errores por código, recarga controlada y validación manual SQL por escenario.

## Manual Testing Checklist

### Panel Admin (Scenarios 1, 2, 4)
- [ ] Verificar login admin OTP funcional en `/admin/login`.
- [ ] Crear categoría nueva desde panel admin y confirmar persistencia tras recargar.
- [ ] Editar categoría existente y confirmar cambios en DB/UI.
- [ ] Crear producto nuevo asociado a categoría existente.
- [ ] Editar producto existente (nombre, descripción) y confirmar persistencia.
- [ ] Confirmar manejo de error usable ante duplicado de `slug` o `name`.
- [ ] Ejecutar validación diferida de HU-2.1: CRUD autenticado permitido en `categories` y `products`.

### Catálogo público (Scenario 3 — Task 7, pendiente implementar)
- [ ] Confirmar que `/catalogo` carga productos desde Supabase (no desde mock local).
- [ ] Desactivar un producto desde el panel admin → confirmar que desaparece del catálogo público sin recompilar.
- [ ] Desactivar una categoría → confirmar que ya no aparece en el filtro de categorías del catálogo.
- [ ] Activar el producto/categoría nuevamente → confirmar que vuelve a aparecer.
- [ ] Acceder a `/producto/:slug` de un producto activo → carga correctamente desde Supabase.
- [ ] Acceder a `/producto/:slug` de un producto inactivo → muestra "producto no encontrado".

## Definition of Done

- [x] Scenarios 1, 2, 4: DAL admin + CRUD panel + tests — commit `d337e18`
- [ ] Scenario 3: catálogo público conectado a Supabase (Task 7, pendiente)
- [ ] No TypeScript errors en Task 7
- [ ] RLS policies tested manualmente (CRUD autenticado + lectura anon solo activos)
- [ ] Manual testing checklist completo (admin + catálogo público)
- [ ] All changes committed with `feat(HU-2.3):` convention
- [ ] Tag `HU-2.3` created
