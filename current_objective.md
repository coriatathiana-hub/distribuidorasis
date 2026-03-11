# Objective: HU-2.4 — UX backoffice admin con rutas dedicadas y layout operativo

## Context

- **Feature:** FEAT-2 — Admin real con Supabase, OTP y seguridad RLS
- **Story:** Como administrador comercial SIS, quiero navegar el admin con rutas separadas por dominio y layout tipo backoffice, para poder operar catalogo con mayor velocidad y claridad en desktop y mobile.
- **Spec Level:** Full
- **TDD Mode:** flexible
- **Git Strategy:** trunk (work continues on `main`)
- **Estimated Duration:** 5h 30m
- **Scope Decision (Option A):** incluir eliminacion controlada en HU-2.4:
  - products: hard delete permitido (FK `product_images` en cascade)
  - categories: delete solo sin productos dependientes (FK restrict)
  - cleanup de binarios en Storage: fuera de alcance (FEAT-3)

## Validation Report (Step 0)

### Target: HU-2.4 — UX backoffice admin con rutas dedicadas y layout operativo

- ✅ `docs/PRD.md`: Vision, personas, alcance MVP y KPIs definidos.
- ✅ `docs/TECH_SPEC.md`: Stack, Data Model, Auth y RLS documentados.
- ✅ `docs/BACKLOG.md`: HU-2.4 existe en FEAT-2 con alcance actualizado (Option A).
- ✅ `.spec/work/FEAT-2/README.md`: HU-2.4 tiene historia C/Q/P + 5 criterios BDD (incluye error/integridad).
- ✅ `current_objective.md`: sin objetivo activo previo.
- ✅ Dependencias: HU-2.1, HU-2.2 y HU-2.3 cerradas.
- ⚠️ `docs/TECH_SPEC.md` (Project Structure) requiere actualización al cierre para reflejar nuevas rutas/componentes de backoffice.

**RESULT:** PASSED WITH WARNINGS
**ACTION:** Se puede proceder con `@apply HU-2.4`. Al finalizar, actualizar `docs/TECH_SPEC.md` y `docs/SETUP.md` si hay cambios operativos.

## Acceptance Criteria (BDD)

### Scenario 1: Navegacion admin dedicada por modulo

- **Dado que:** Estoy autenticado como admin.
- **Cuando:** Entro al backoffice.
- **Entonces:** Debo disponer de rutas separadas para productos y categorias, sin depender de tabs en una sola pantalla.

### Scenario 2: Layout operativo responsive

- **Dado que:** Uso desktop o mobile.
- **Cuando:** Navego entre modulos admin.
- **Entonces:** Debe existir sidebar fija en desktop y menu colapsable en mobile.

### Scenario 3: Listados y acciones por fila

- **Dado que:** Visualizo tabla de productos/categorias.
- **Cuando:** Uso busqueda/filtros y acciones por fila.
- **Entonces:** Debo poder identificar estado y ejecutar acciones disponibles (ver, editar, activar/desactivar, eliminar).

### Scenario 4: Alta/edicion con baja friccion

- **Dado que:** Necesito crear o editar un registro.
- **Cuando:** Abro el flujo de formulario.
- **Entonces:** Debe abrirse en modal o drawer lateral con validaciones y mensajes claros.

### Scenario 5: Eliminacion controlada por reglas de integridad

- **Dado que:** Estoy autenticado como admin y necesito eliminar datos de prueba o registros obsoletos.
- **Cuando:** Elimino un producto o una categoria desde su accion por fila.
- **Entonces:** Debe cumplirse lo siguiente:
  - Producto: se permite hard delete y se eliminan en cascada los registros de `product_images`.
  - Categoria: solo se permite eliminar si no tiene productos asociados.
  - Si hay dependencias, la UI muestra mensaje accionable y mantiene el estado del listado.

## Implementation Plan

### ~~Task 1: Definir routing de backoffice y shell de layout operativo~~ ✅ DONE
- **Commit:** `f95f046` — `App.tsx` (nested routes), `AdminLayout.tsx` (nuevo), `AdminLogin.tsx`

### ~~Task 2: Implementar navegacion lateral responsive~~ ✅ DONE
- **Commit:** `f95f046` — `AdminSidebar.tsx` (nav links, active state, signout, mobile Sheet)

### ~~Task 3: Crear vistas dedicadas /admin/productos y /admin/categorias~~ ✅ DONE
- **Commit:** `f95f046` — `AdminProductos.tsx`, `AdminCategorias.tsx` (thin wrappers)

### ~~Task 4: Extender DAL admin para eliminacion controlada~~ ✅ DONE
- **Commit:** `f5d24a6` — `admin-catalog-service.ts`: `deleteProduct()`, `deleteCategory()` con mapping 23503

### ~~Task 5: Implementar acciones de eliminar con confirmacion en tablas~~ ✅ DONE
- **Commit:** `f5d24a6` — `CategoryManager.tsx`, `ProductManager.tsx`: `AlertDialog` con botón `Trash2`

### ~~Task 6: Manejo de errores de integridad y mensajes accionables~~ ✅ DONE
- **Commit:** `f5d24a6` — error toast accionable para FK 23503 en categorías

### ~~Task 7: Cobertura de pruebas de rutas, layout y delete~~ ✅ DONE
- **Commit:** `c0926c8` — 21 nuevos tests (104 total):
  - `admin-layout-routes.test.tsx` (10 tests — sidebar nav, active, signout, Outlet)
  - `admin-catalog-service.test.ts` (+5 — deleteProduct, deleteCategory, 23503)
  - `admin-categories-persistence.test.tsx` (+3 — dialog, confirm, FK error)
  - `admin-products-persistence.test.tsx` (+3 — dialog, confirm, error)

### ~~Task 8: Trazabilidad documental y checklist operativo~~ ✅ DONE
- **Commit:** (este commit) — `docs/TECH_SPEC.md`, `docs/SETUP.md`

## Database Changes (if applicable)

- **No nuevas migraciones planeadas** para HU-2.4.
- Se reutilizan constraints existentes:
  - `products.category_id -> categories.id` (`ON DELETE RESTRICT`)
  - `product_images.product_id -> products.id` (`ON DELETE CASCADE`)
- Reglas de negocio de eliminación:
  - Delete de categoría con dependencias debe fallar por integridad y mostrarse como error accionable.
  - Delete de producto debe eliminar `product_images` (rows) por cascade.
- **Nota:** limpieza de objetos binarios del bucket `products` queda en FEAT-3 (out of scope HU-2.4).

## Infrastructure Changes

- **New env vars:** none.
- **New external services:** none.
- **SETUP.md update required:** Sí, para checklist de validación de eliminación controlada.

## Risks and Dependencies

- **Dependency:** HU-2.3 estable (DAL + managers + catálogo público en Supabase).
- **Risk:** regressions al mover rutas de `/admin` a rutas anidadas.
- **Risk:** UX inconsistente entre desktop/mobile en navegación lateral.
- **Risk:** mensajes ambiguos ante errores FK al eliminar categorías con productos.
- **Mitigation:** pruebas de rutas, pruebas de interacción en managers y validación manual de integridad.

## Manual Testing Checklist

### Navegación y layout
- [x] Login OTP funcional y redirect a backoffice operativo.
- [x] `/admin` redirige de forma consistente a módulo por defecto.
- [x] `/admin/productos` y `/admin/categorias` son accesibles solo con sesión admin.
- [x] Sidebar fija en desktop; menú colapsable funcional en mobile.
- [x] Estado activo de navegación correcto al cambiar de módulo.

### Operación de catálogo
- [x] Crear/editar/toggle en productos desde ruta dedicada.
- [x] Crear/editar/toggle en categorías desde ruta dedicada.
- [x] Eliminar producto con confirmación y verificar que desaparece del listado.
- [x] Eliminar categoría sin productos y verificar éxito.
- [x] Intentar eliminar categoría con productos y verificar error accionable (sin romper UI).
- [x] Recargar pantalla y confirmar persistencia real en Supabase.

### Integridad y RLS
- [ ] Verificar que anon no puede acceder a rutas admin.
- [ ] Verificar que operaciones delete solo funcionan con admin autenticado.
- [ ] Confirmar que delete de producto no rompe lectura pública del catálogo.

## Definition of Done

- [ ] Todos los criterios BDD de HU-2.4 cubiertos por pruebas passing.
- [ ] No TypeScript errors.
- [ ] RLS y reglas de integridad validadas manualmente (delete incluido).
- [ ] `docs/TECH_SPEC.md` actualizado con estructura final de backoffice.
- [ ] `docs/SETUP.md` actualizado con checklist operativo HU-2.4.
- [ ] CHANGELOG entry draft listo para cierre.
- [ ] Cambios versionados con convención `feat(HU-2.4):`.
- [ ] Tag `HU-2.4` creado en `@finish-objective`.
