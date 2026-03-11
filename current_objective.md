# Objective: HU-2.1 — Provision de Supabase y modelo base con politicas RLS iniciales

## Context

- **Feature:** FEAT-2 — Admin real con Supabase, OTP y seguridad RLS
- **Story:** Como administrador de plataforma, quiero configurar esquema base en Supabase con politicas de acceso, para poder asegurar persistencia y seguridad desde el inicio del modulo admin.
- **Spec Level:** Full
- **TDD Mode:** flexible
- **Git Strategy:** trunk (work continues on `main`)
- **Estimated Duration:** 3h 30m
- **Execution Time Tracking:** El tiempo real se registrara como ventana operativa (`@start-objective` -> `@finish-objective`) y se complementara con timestamps de commits.

## Validation Report (Step 0)

### Target: HU-2.1 — Provision de Supabase y modelo base con politicas RLS iniciales

- ✅ `PRD.md`: FEAT-2 está dentro del alcance MVP (admin real con Supabase + RLS).
- ✅ `TECH_SPEC.md`: Modelo de datos base y matriz RLS definidos para `profiles`, `categories`, `products`.
- ✅ `docs/BACKLOG.md`: HU-2.1 existe bajo FEAT-2 en estado pendiente.
- ✅ `.spec/work/FEAT-2/README.md`: HU-2.1 definida con C/Q/P + BDD + escenario de error.
- ✅ `current_objective.md`: sin objetivo activo previo.
- ✅ Dependencia de infraestructura principal: proyecto Supabase ya creado.

**RESULT:** PASSED  
**ACTION:** Se puede proceder con la planeacion de HU-2.1.

## Acceptance Criteria (BDD)

### Scenario 1: Esquema base de datos operativo

- **Dado que:** El proyecto Supabase esta creado.
- **Cuando:** Se ejecutan las migraciones iniciales de FEAT-2.
- **Entonces:** Deben existir tablas `profiles`, `categories`, `products` y relaciones definidas sin errores.

### Scenario 2: Politicas RLS minimas aplicadas

- **Dado que:** Las tablas del catalogo ya existen.
- **Cuando:** Se habilita RLS y se aplican politicas.
- **Entonces:** `anon` solo puede leer catalogo activo y usuarios admin autenticados pueden ejecutar CRUD.

### Scenario 3: Acceso no autorizado

- **Dado que:** Un usuario anonimo intenta escribir en `products`.
- **Cuando:** Ejecuta `insert`, `update` o `delete`.
- **Entonces:** El motor debe denegar la operacion por politica RLS.

## Implementation Plan

### Task 1: Preparar estructura Supabase local en repo y baseline de migraciones (~35 min) ✅

- **Type:** [DB]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `supabase/migrations/001_initial_catalog_schema.sql`, `supabase/migrations/002_initial_rls_policies.sql`, `supabase/seed.sql`
- **Commit:** Pendiente (se registrara en commit final)

### Task 2: Definir SQL del esquema base (`profiles`, `categories`, `products`) con constraints/FKs (~50 min) ✅

- **Type:** [DB]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `supabase/migrations/001_initial_catalog_schema.sql`
- **Commit:** Pendiente (se registrara en commit final)

### Task 3: Implementar politicas RLS para `anon` y `authenticated admin` en tablas base (~55 min) ✅

- **Type:** [DB]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `supabase/migrations/002_initial_rls_policies.sql`
- **Commit:** Pendiente (se registrara en commit final)

### Task 4: Integrar bootstrap de cliente Supabase y variables de entorno en app (~40 min) ✅

- **Type:** [DAL]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/lib/supabase/client.ts`, `app/src/types/supabase.ts`, `app/.env.example`, `app/package.json`
- **Commit:** Pendiente (se registrara en commit final)

### Task 5: Agregar pruebas/contratos base para validar reglas de acceso y cimientos de HU-2.1 (~55 min) ✅

- **Type:** [TEST]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `app/src/test/supabase-schema-contract.test.ts`
- **Commit:** Pendiente (se registrara en commit final)

### Task 6: Alinear documentacion tecnica y de setup con artefactos reales de migracion (~35 min) ✅

- **Type:** [DOC]
- **Cycle:** IMPLEMENT ✅ → TEST ✅ → REFACTOR ✅
- **Files modified:** `docs/TECH_SPEC.md`, `docs/SETUP.md`
- **Commit:** Pendiente (se registrara en commit final)

## Database Changes

> SQL de referencia para HU-2.1. Se materializa en migraciones versionadas (`001` y `002`).

```sql
-- 001_initial_catalog_schema.sql
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null check (role in ('admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text unique not null,
  short_description text,
  description text,
  specs_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

```sql
-- 002_initial_rls_policies.sql
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- categories: anon read active
create policy "categories_anon_select_active"
on public.categories
for select
to anon
using (is_active = true);

-- products: anon read active
create policy "products_anon_select_active"
on public.products
for select
to anon
using (is_active = true);

-- helper predicate inline for admin checks
create policy "categories_admin_all"
on public.categories
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

create policy "products_admin_all"
on public.products
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
```

## Infrastructure Changes

- **New environment variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **New external services:** Supabase project `distribuidorasis` (ya creado)
- **New storage/buckets:** None en HU-2.1
- **New auth configuration:** Email OTP + redirect URLs quedan como prerequisito operativo para HU-2.2
- **SETUP.md update required:** Yes (variables + setup steps de migraciones)

## Risks and Dependencies

- **Dependency:** Claves Supabase disponibles en entorno local para conectar app.
- **Risk:** Divergencia entre SQL implementado y tabla RLS definida en `TECH_SPEC.md`.
- **Risk:** Exponer `SUPABASE_SERVICE_ROLE_KEY` en cliente por mala configuracion de env.
- **Mitigation:** Mantener `service role` solo en contexto server/tools y documentar claramente en `SETUP.md`.

## Manual Testing Checklist

- [ ] Confirmar que existen migraciones `001` y `002` en `supabase/migrations/` con tablas/politicas de HU-2.1.
- [ ] Verificar en Supabase SQL Editor que tablas base fueron creadas sin errores.
- [ ] Validar que `anon` puede hacer `select` solo sobre registros activos en `categories`/`products`.
- [ ] Validar que `anon` recibe denegacion en `insert/update/delete` sobre `products`.
- [ ] Validar que usuario `authenticated` con perfil admin activo puede ejecutar operaciones CRUD en `categories` y `products`.

## Definition of Done

- [ ] All BDD criteria have passing tests
- [ ] No TypeScript errors
- [ ] RLS policies tested (if applicable)
- [ ] Manual testing checklist verified
- [ ] CHANGELOG entry drafted
- [ ] All changes committed with `feat(HU-2.1):` convention
- [ ] Tag `HU-2.1` created
