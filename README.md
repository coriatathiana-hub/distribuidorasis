# distribuidorasis

Mobile-first catalog and commercial operations platform for **Distribuidora SIS**, built with React + Vite and backed by Supabase (Auth OTP + PostgreSQL + RLS).

## Current Status

- `FEAT-1` Delivered: foundation UX (navigation, catalog filters, product detail).
- `FEAT-2` Delivered: real admin panel with OTP auth, protected routes, CRUD, controlled delete.
- `FEAT-3` Pending: multi-image product management and public carousel experience.
- `FEAT-4` Pending: real omnichannel contact flow (email + WhatsApp).

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

## Tomorrow Plan (FEAT-3 + FEAT-4)

### FEAT-3 (Product multi-image + carousels)

- Product images table + storage workflow alignment
- Admin image gallery management per product (upload, reorder, cover)
- Public product/list card carousel integration
- Controlled delete consistency between DB rows and storage objects

### FEAT-4 (Omnichannel contact)

- Contact form -> transactional email delivery to `ventas@distribuidorasis.com.mx`
- WhatsApp contextual CTA and message prefill
- Delivery validation and operational observability

### Infrastructure Checklist (Domains, Cloudflare, Resend, and related)

- Domain strategy
  - Confirm primary production domain and subdomain strategy (`www`, `admin` if needed)
  - Define canonical redirects and HTTPS-only policy
- Cloudflare
  - Zone onboarding and nameserver cutover
  - DNS records for app host
  - SSL/TLS mode and minimum TLS version
  - Cache rules (avoid caching admin/auth-sensitive routes)
  - WAF basic managed rules + bot protection baseline
- Resend
  - Domain verification
  - SPF/DKIM/DMARC alignment
  - API key provisioning and secret management
  - Sender identity (`CONTACT_EMAIL_FROM`) and test delivery to sales inbox
- App hosting/runtime
  - Environment variables parity (staging/production)
  - Build and deploy pipeline verification
  - Health-check and rollback procedure
- Supabase production hardening
  - RLS review for all tables used by FEAT-3/FEAT-4
  - Storage bucket policies (`products`) validation
  - Backup and retention checks

## Documentation

- Product requirements: `docs/PRD.md`
- Technical architecture: `docs/TECH_SPEC.md`
- Setup and infra: `docs/SETUP.md`
- SAFe backlog: `docs/BACKLOG.md`
- Delivery history: `docs/CHANGELOG.md`

