# distribuidorasis

Mobile-first catalog and commercial operations platform for **Distribuidora SIS**, built with React + Vite and backed by Supabase (Auth OTP + PostgreSQL + RLS).

## Current Status

- `FEAT-1` Delivered: foundation UX (navigation, catalog filters, product detail).
- `FEAT-2` Delivered: real admin panel with OTP auth, protected routes, CRUD, controlled delete.
- `FEAT-3` Delivered: multi-image product management and public carousel experience.
- `FEAT-4` Delivered: omnichannel contact flow (email + WhatsApp) plus conversion dashboard.

Backlog source of truth: `docs/BACKLOG.md`.

## Stack

- Frontend: React 18, TypeScript, Vite
- UI: TailwindCSS, shadcn/ui, Radix primitives
- Backend services: Supabase (PostgreSQL, Auth OTP, Storage, RLS)
- Testing: Vitest + React Testing Library
- Workflow: SpecSeed (SAFe-aligned objective lifecycle)

## Project Structure

```text
app/                # Frontend app (public site + admin backoffice)
docs/               # PRD, TECH_SPEC, BACKLOG, SETUP, CHANGELOG
supabase/           # SQL migrations, seed scripts, operational SQL
.spec/              # SpecSeed commands, history, active objective artifacts
```

## Quick Start

1. Install dependencies
   - `cd app`
   - `npm install`
2. Configure environment variables (`.env.local`) using `docs/SETUP.md`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (Server-side secrets are documented in SETUP for FEAT-4)
3. Run the app
   - `npm run dev`
4. Run tests
   - `npm run test -- --run`
5. Optional quality checks
   - `npm run lint`
   - `npx tsc --noEmit`

## Admin Routing (HU-2.4)

- `/admin/login` -> OTP login page (standalone)
- `/admin` -> guarded redirect to `/admin/productos`
- `/admin/productos` -> product operations
- `/admin/categorias` -> category operations

Architecture decision: route trees are split by layout (`PublicLayout` vs `AdminLayout`), documented as `ADR-005` in `docs/TECH_SPEC.md`.

## Go-live and Operations

All deployment, DNS, auth URLs, tunnel, anti-abuse, and smoke-test procedures are centralized in:

- `docs/SETUP.md`

## Documentation

- Product requirements: `docs/PRD.md`
- Technical architecture: `docs/TECH_SPEC.md`
- Setup and infra: `docs/SETUP.md`
- SAFe backlog: `docs/BACKLOG.md`
- Delivery history: `docs/CHANGELOG.md`

