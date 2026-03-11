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
| `WHATSAPP_PHONE_E164` | Public | Business operational config (`525551627054`) | FEAT-4 |

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

> List migration files in execution order.

| Migration | Description | Added by |
|:----------|:------------|:---------|
| `001_initial_catalog_schema.sql` | Creates `profiles`, `categories`, `products`, `product_images`, `contact_requests` | FEAT-2/3/4 |
| `002_rls_policies.sql` | Adds RLS policies for public and admin roles | FEAT-2 |
| `003_storage_policies.sql` | Adds storage policies for bucket `products` | FEAT-3 |

### 3.3 Schema Details

Core schema is documented in `docs/TECH_SPEC.md` under Data Model section.

### 3.4 Security Policies

- Public (`anon`) can read only active catalog data and create `contact_requests`.
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

1. Enable Email OTP in Supabase Authentication.
2. Configure allowed redirect URLs for local and production domains.
3. Disable public signup if admin users are controlled by allowlist process.
4. Provision admin identities and matching rows in `profiles`.

### 4.2 Auth Flow Summary

1. Admin enters email on `/admin/login`.
2. System requests OTP to Supabase.
3. Admin submits OTP code.
4. Session is created and validated against `profiles` role.
5. Admin can access `/admin`; non-admin or inactive users are rejected.

### 4.3 Files Involved

| File | Role |
|:-----|:-----|
| `src/lib/supabase/client.ts` | Browser Supabase client bootstrap |
| `src/lib/supabase/auth.ts` | OTP request/verify helpers |
| `src/pages/Admin.tsx` | Protected admin shell and guards |
| `src/components/admin/ProductManager.tsx` | Product CRUD UI |
| `src/components/admin/ImageGalleryManager.tsx` | Product image management UI |

---

## 5. Storage

> Document file storage configuration (buckets, CDN, upload limits, policies).

### 5.1 `products` bucket

- **Purpose:** Stores product images used in catalog, product detail, and admin gallery.
- **Public access:** Yes (read), restricted write.
- **Size limit:** 5 MB per image (recommended MVP limit).
- **Allowed types:** `image/jpeg`, `image/png`, `image/webp`.
- **Policies:** Public read for active catalog images; write/update/delete only for authenticated admin users.
- **Added by:** FEAT-3

---

## 6. Application Configuration

> Document hardcoded values, feature flags, or configuration constants that
> must be customized before production.

| Constant / Setting | Current Value | Action Required |
|:-------------------|:-------------|:----------------|
| `APP_NAME` | `"Distribuidora SIS"` | Confirm legal branding in production |
| `CONTACT_EMAIL_TARGET` | `"ventas@distribuidorasis.com.mx"` | Keep synchronized with `CONTACT_EMAIL_TO` |
| `WHATSAPP_DEFAULT_MESSAGE` | `"Hola, deseo una cotizacion de sus productos."` | Tune by source page/product context |
| `CATALOG_PAGE_SIZE` | `12` | Validate performance vs UX on low-end mobile devices |

---

## 7. Quick Start Checklist

### First-time setup (development)

```
# 1. Clone and install
git clone <repo-url>
cd distribuidorasis
cd app
bun install

# 2. Environment variables
cp .env.example .env.local
# configure Supabase + email provider variables

# 3. Run the app
bun run dev
```

### Infrastructure checklist

- [ ] Supabase project created and API keys configured
- [ ] Database migrations executed in order
- [ ] Auth OTP flow validated with admin allowlist
- [ ] Storage bucket `products` created with policies
- [ ] Transactional email provider configured and tested
- [ ] Contact form sends to `ventas@distribuidorasis.com.mx`
- [ ] WhatsApp CTA tested on mobile and desktop

### Production deployment

- [ ] Hosting project connected (Railway/Netlify)
- [ ] Environment variables set in production
- [ ] Auth redirect URLs updated for production domain
- [ ] CORS/origin allowlist reviewed for API/function endpoints
- [ ] Smoke test completed for catalog, admin, contact email, and WhatsApp flow
