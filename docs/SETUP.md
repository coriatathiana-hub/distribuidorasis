# Setup & Configuration Guide

> **Project:** distribuidorasis
> **Last updated:** 2026-03-10
>
> This guide covers all infrastructure prerequisites needed to run the project
> in development and production environments. It is updated incrementally as
> each User Story introduces new infrastructure requirements.

---

## Table of Contents

1. [Environment Variables](#1-environment-variables)
2. [External Services](#2-external-services)
3. [Database](#3-database)
4. [Authentication](#4-authentication)
5. [Storage](#5-storage)
6. [Application Configuration](#6-application-configuration)
7. [Quick Start Checklist](#7-quick-start-checklist)

---

## 1. Environment Variables

> List every environment variable the application needs, grouped by visibility
> (public vs secret) and by service.

| Variable | Type | Where to find | Added by |
|:---------|:-----|:-------------|:---------|
| `VITE_SUPABASE_URL` | Public | Supabase Project Settings > API | FEAT-2 |
| `VITE_SUPABASE_ANON_KEY` | Public | Supabase Project Settings > API | FEAT-2 |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase Project Settings > API | FEAT-2 |
| `CONTACT_EMAIL_TO` | Secret | Operational config (`ventas@distribuidorasis.com.mx`) | FEAT-4 |
| `CONTACT_EMAIL_FROM` | Secret | Email provider dashboard | FEAT-4 |
| `RESEND_API_KEY` | Secret | Resend dashboard/API keys (or provider equivalent) | FEAT-4 |
| `VITE_WHATSAPP_PHONE_E164` | Public | Business operational config (`525551627054`) | FEAT-4 |

> Note: if another transactional provider is chosen (SendGrid/Postmark), replace `RESEND_API_KEY`
> with that provider's key and update this table.

---

## 2. External Services

> Document every third-party service or cloud resource the project depends on.
> Include account setup steps and relevant dashboard URLs.

### 2.1 Supabase

- **Purpose:** PostgreSQL database, Auth OTP, Storage for product images, and RLS enforcement.
- **Dashboard:** https://supabase.com/dashboard
- **Setup steps:**
  1. Create project `distribuidorasis` in preferred region.
  2. Enable Email OTP sign-in in Authentication.
  3. Create bucket `products` for product images.
  4. Configure RLS policies for `profiles`, `categories`, `products`, `product_images`, `contact_requests`.
  5. Register admin users in `profiles` table.
- **Added by:** FEAT-2 / FEAT-3

### 2.2 Transactional Email Provider (Resend preferred)

- **Purpose:** Deliver contact requests from web form to sales inbox.
- **Dashboard:** https://resend.com/ (or equivalent provider)
- **Setup steps:**
  1. Create account and verify sender domain.
  2. Configure API key as `RESEND_API_KEY`.
  3. Set sender mailbox in `CONTACT_EMAIL_FROM`.
  4. Validate delivery to `ventas@distribuidorasis.com.mx`.
- **Operational smoke test (before FEAT-4 implementation):**
  1. Ensure `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`, and `RESEND_API_KEY` are set in `.env.local`.
  2. Trigger a direct provider test call from terminal:
     ```bash
     curl -sS https://api.resend.com/emails \
       -H "Authorization: Bearer $RESEND_API_KEY" \
       -H "Content-Type: application/json" \
       -d '{
         "from": "'"$CONTACT_EMAIL_FROM"'",
         "to": ["'"$CONTACT_EMAIL_TO"'"],
         "subject": "FEAT-4 setup validation",
         "html": "<p>Resend setup validated for distribuidorasis.</p>"
       }'
     ```
  3. Confirm API success response includes an email `id` and that the message reaches `ventas@distribuidorasis.com.mx`.
- **Runtime path for HU-4.1 (`send-contact-email`):**
  1. Deploy/serve Supabase Edge Function `send-contact-email`.
  2. Configure function auth for public contact flow (`/contacto`):
     - Disable JWT enforcement (`verify_jwt = false`) for this function.
     - Rationale: the web form is public and invokes the function as `anon`.
  3. Ensure function secrets are configured in Supabase environment:
     - `RESEND_API_KEY`
     - `CONTACT_EMAIL_TO`
     - `CONTACT_EMAIL_FROM`
     - `SUPABASE_SERVICE_ROLE_KEY`
  4. Submit from `/contacto` and verify both outcomes:
     - row inserted in `public.contact_requests`,
     - transactional email delivered to `ventas@distribuidorasis.com.mx`.
- **Added by:** FEAT-4

### 2.3 Hosting Platform (Railway preferred)

- **Purpose:** Host frontend and serverless contact endpoint.
- **Dashboard:** https://railway.com/project
- **Setup steps:**
  1. Connect repository and configure build for Vite.
  2. Add all environment variables from section 1.
  3. Configure production domain and HTTPS.
- **Added by:** FEAT-1 / FEAT-4

---

## 3. Database

> Document the database engine, how to run migrations, schema details, security
> policies, and seed data.

### 3.1 Engine & Connection

- **Engine:** PostgreSQL (Supabase managed)
- **Connection:** Supabase dashboard, Supabase CLI, and application via `VITE_SUPABASE_URL`.

### 3.2 Migrations

> List migration files in execution order. Files live in `supabase/migrations/`.
> Apply via Supabase Dashboard SQL Editor or Supabase CLI (`supabase db push`).

| Migration | Description | Added by |
|:----------|:------------|:---------|
| `001_initial_catalog_schema.sql` | Creates `profiles`, `categories`, `products`, `product_images`, `contact_requests` + `set_updated_at` trigger | HU-2.1 |
| `002_initial_rls_policies.sql` | Enables RLS + anon/admin policies for all catalog tables and `contact_requests` | HU-2.1 |
| `003_fix_profiles_self_select.sql` | Adds authenticated self-select policy on `profiles` to support post-OTP role checks | HU-2.2 |
| `004_fix_profiles_policy_recursion.sql` | Removes recursive `profiles` policies and keeps safe `profiles_self_select` policy | HU-2.2 |
| `005_products_name_unique.sql` | Adds `UNIQUE` constraint on `products.name` (omission in 001; `categories.name` was already unique) | HU-2.3 |
| `006_product_images_gallery_rules.sql` | Adds check constraints + unique indexes to `product_images` (sort_order ≥ 0, non-empty URLs, unique sort slot per product, single cover per product) | HU-3.1 |
| `007_whatsapp_cta_attempts.sql` | Creates `whatsapp_cta_attempts` table + RLS (`anon` insert, admin select) and indexes for omnichannel CTA traceability | HU-4.3 |

### 3.3 Schema Details

Core schema is documented in `docs/TECH_SPEC.md` under Data Model section.

### 3.4 Security Policies

- Public (`anon`) can read only active catalog data, create `contact_requests`, and insert `whatsapp_cta_attempts`.
- Authenticated admins can perform CRUD operations on catalog and contact entities.
- Admin identity is validated by role in `profiles` (`role='admin'` and active).

### 3.5 Seed Data (Development)

- Add a local seed script with:
  - Base categories
  - Minimum 10 representative products
  - Product images metadata
  - One admin profile for test environment

---

## 4. Authentication

> Document the authentication method, provider configuration, and relevant files.

- **Method:** Email + OTP code
- **Provider:** Supabase Auth

### 4.1 Provider Configuration

> Required baseline for HU-2.2 (OTP code flow, not password login):

1. In Supabase Dashboard, go to **Authentication -> Providers -> Email**.
2. Enable Email provider and activate OTP sign-in.
3. Disable password-based login for admin flow (keep OTP-only policy for MVP).
4. Set email template to include one-time code token (6 digits) and clear expiration notice.
5. Configure URL allowlist in **Authentication -> URL Configuration**:
   - `Site URL` (dev): `http://localhost:5173`
   - `Redirect URLs` (dev): `http://localhost:5173/**`
   - Add production domain equivalents when available.
6. Disable open public signup for admin if users are controlled by allowlist.
7. Create admin users in Supabase Auth and ensure matching rows in `public.profiles`:
   - `id = auth.users.id`
   - `email` normalized in lowercase
   - `role = 'admin'`
   - `is_active = true`

### 4.2 OTP Code Flow Contract (HU-2.2)

1. **Request OTP:** `signInWithOtp({ email, options: { shouldCreateUser: false } })`
2. **Verify OTP:** `verifyOtp({ email, token, type: 'email' })`
3. **Authorize access:** session is valid only if `profiles.role='admin' AND is_active=true`
4. **Reject access:** invalid/expired code, non-allowlisted email, or inactive profile

### 4.3 Security Requirements for OTP

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in frontend runtime.
- Keep OTP expiration short (recommended default from Supabase Auth).
- Enforce rate-limit behavior from Supabase defaults; UI must show cooldown/retry messaging.
- Avoid revealing whether an email exists in allowlist through detailed error responses.

### 4.4 Operational Validation Checklist (pre-`@apply HU-2.2`)

- [ ] OTP email is delivered to test admin mailbox.
- [ ] OTP code can be verified from `/admin/login`.
- [ ] Non-admin authenticated user is denied access to `/admin`.
- [ ] Inactive admin (`is_active=false`) is denied access to `/admin`.
- [ ] Session refresh keeps admin inside `/admin` while token is valid.
- [ ] Sign-out invalidates protected route access.
### 4.5 Auth Flow Summary

1. Admin enters email on `/admin/login`.
2. System requests OTP to Supabase.
3. Admin submits OTP code.
4. Session is created and validated against `profiles` role.
5. Admin can access `/admin`; non-admin or inactive users are rejected.
### 4.6 Files Involved

| File | Role | Added by |
|:-----|:-----|:---------|
| `app/src/lib/supabase/client.ts` | Browser Supabase client bootstrap with Database types | HU-2.1 |
| `app/src/types/supabase.ts` | TypeScript Database type contract (Row/Insert/Update per table) | HU-2.1 |
| `app/src/lib/supabase/auth.ts` | OTP request/verify helpers | HU-2.2 (pending) |
| `app/src/pages/Admin.tsx` | Protected admin shell and guards | HU-2.2 (pending) |
| `app/src/components/admin/ProductManager.tsx` | Product CRUD UI | HU-2.3 (pending) |
| `app/src/components/admin/ImageGalleryManager.tsx` | Product image management UI | FEAT-3 (pending) |

---

## 5. Storage

> Document file storage configuration (buckets, CDN, upload limits, policies).

### 5.1 `products` bucket

- **Purpose:** Stores product images used in catalog, product detail, and admin gallery.
- **Public access:** Yes (read), restricted write.
- **Size limit:** 5 MB per image (recommended MVP limit).
- **Allowed types:** `image/jpeg`, `image/png`, `image/webp`.
- **Policies:** Public read for active catalog images; write/update/delete only for authenticated admin users.
- **Critical prerequisite (HU-3.2):** Before testing gallery uploads, `storage.objects` must include admin-write policies for bucket `products`. Missing policies causes `new row violates row-level security policy` during upload/insert flow.
- **Added by:** FEAT-3

---

## 6. Application Configuration

> Document hardcoded values, feature flags, or configuration constants that
> must be customized before production.

| Constant / Setting | Current Value | Action Required |
|:-------------------|:-------------|:----------------|
| `APP_NAME` | `"Distribuidora SIS"` | Confirm legal branding in production |
| `CONTACT_EMAIL_TARGET` | `"ventas@distribuidorasis.com.mx"` | Keep synchronized with `CONTACT_EMAIL_TO` |
| `WHATSAPP_DEFAULT_MESSAGE` | `"Hola, me gustaría solicitar información sobre sus productos y servicios."` | Tune by source page/product context |
| `CATALOG_PAGE_SIZE` | `12` | Validate performance vs UX on low-end mobile devices |

---

## 7. Quick Start Checklist

### First-time setup (development)

```
# 1. Clone and install
git clone <repo-url>
cd distribuidorasis/app
npm install        # or: bun install

# 2. Environment variables
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from Supabase Project Settings > API
# fill in FEAT-4 variables: CONTACT_EMAIL_TO, CONTACT_EMAIL_FROM, RESEND_API_KEY, VITE_WHATSAPP_PHONE_E164

# 3. Apply database migrations (Supabase Dashboard SQL Editor or CLI)
# Run in order: 001_initial_catalog_schema.sql → 002_initial_rls_policies.sql
# Optionally: run supabase/seed.sql for development data

# 4. Run the app
npm run dev
```

### Infrastructure checklist

- [x] Supabase project created (HU-2.1)
- [x] Migration files created: 001 (schema) + 002 (RLS) (HU-2.1)
- [x] API keys configured in `.env.local` (HU-2.1)
- [x] Migrations executed in Supabase SQL Editor (HU-2.1)
- [x] Seed data applied (`supabase/seed.sql`) for development (HU-2.1)
- [x] Admin user created in Supabase Auth > Users (HU-2.2)
- [x] Admin profile row inserted in `public.profiles` with `role='admin'`, `is_active=true` (HU-2.2)
- [x] Email OTP provider enabled in Supabase Auth (HU-2.2)
- [x] Redirect URLs configured: `http://localhost:5173` and `http://localhost:5173/**` (HU-2.2)
- [x] OTP flow validated: email received, code verified, access to `/admin` confirmed (HU-2.2)
- [ ] Admin CRUD validated: create/edit/toggle categories and products via real Supabase panel (HU-2.3)
- [ ] RLS CRUD autenticado validado manualmente: escritura a `categories` + `products` confirmada (HU-2.3)
- [ ] Backoffice routing verified: /admin redirects to /admin/productos, /admin/categorias accessible (HU-2.4)
- [ ] Delete product confirmed: product disappears from list; product_images rows cascade deleted (HU-2.4)
- [ ] Delete empty category confirmed: category removed from list and from public catalog filters (HU-2.4)
- [ ] Delete category with products blocked: actionable error toast shown, UI remains stable (HU-2.4)
- [ ] Mobile sidebar confirmed: hamburger opens Sheet on mobile viewport, closes on nav click (HU-2.4)
- [x] Migration 006 applied: gallery business rules (check constraints + unique indexes on product_images) (HU-3.1)
- [x] Storage bucket `products` created with public-read + admin-write policies (HU-3.2)
- [x] FEAT-4 env variables documented in `app/.env.example` and setup guide (`CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`, `RESEND_API_KEY`, `VITE_WHATSAPP_PHONE_E164`) (FEAT-4 pre-setup)
- [x] Transactional provider smoke test procedure documented (Resend API call + expected response/email delivery) (FEAT-4 pre-setup)
- [x] `contact_requests` schema + RLS baseline verified in migrations (`001` + `002`) (FEAT-4 pre-setup)
- [x] Contact form sends to `ventas@distribuidorasis.com.mx` via real endpoint/function (FEAT-4 post-implementation)
- [ ] Migration `007_whatsapp_cta_attempts.sql` applied and RLS verified (`anon` insert + admin select) (HU-4.3)
- [ ] WhatsApp CTA tested on mobile and desktop with contextual message behavior (FEAT-4 post-implementation)

### Production deployment

- [ ] Hosting project connected (Railway/Netlify)
- [ ] Environment variables set in production
- [ ] Auth redirect URLs updated for production domain
- [ ] CORS/origin allowlist reviewed for API/function endpoints
- [ ] Smoke test completed for catalog, admin, contact email, and WhatsApp flow
