# Setup & Operations Guide (Single Source of Truth)

> **Project:** distribuidorasis  
> **Last updated:** 2026-03-18  
> **Scope:** end-to-end setup for local, staging, and production.

This document is the canonical setup/runbook for:
- Railway deployment
- Cloudflare DNS and Tunnel
- Supabase Auth/DB/Storage
- Resend transactional email
- Image migration from `app/public/products` to Supabase Storage
- Go-live validation and first-24h operations

---

## 1) Environment Matrix and Canonical URLs

| Environment | App URL | Auth Site URL | Auth Redirect URLs | Purpose |
|:------------|:--------|:--------------|:-------------------|:--------|
| Local | `http://localhost:8080` | `http://localhost:8080` | `http://localhost:8080/**` | Development |
| Staging | `https://staging.distribuidorasis.com.mx` | `https://staging.distribuidorasis.com.mx` | `https://staging.distribuidorasis.com.mx/**` | QA and demos |
| Production | `https://www.distribuidorasis.com.mx` | `https://www.distribuidorasis.com.mx` | `https://www.distribuidorasis.com.mx/**` | Live traffic |

> If apex (`distribuidorasis.com.mx`) is used as canonical, keep a single 301 redirect policy and apply the same URLs in Supabase Auth.

---

## 2) Required Variables

### 2.1 Frontend + App Runtime

| Variable | Type | Notes |
|:---------|:-----|:------|
| `VITE_SUPABASE_URL` | Public | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public | Supabase anon key |
| `VITE_WHATSAPP_PHONE_E164` | Public | Example: `525551627054` |

### 2.2 Secrets (Supabase Functions / CI / scripts)

| Variable | Type | Notes |
|:---------|:-----|:------|
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Never expose in frontend |
| `CONTACT_EMAIL_TO` | Secret | Production target: `ventas@distribuidorasis.com.mx` |
| `CONTACT_EMAIL_FROM` | Secret | Resend verified sender/domain |
| `RESEND_API_KEY` | Secret | Server-only API key |
| `ALLOWED_ORIGINS` | Secret | Comma-separated CORS allowlist for `send-contact-email` |

---

## 3) Railway Production Setup

1. Create/connect Railway project to this repository.
2. Set root directory to `app/`.
3. Configure build/start:
   - Build command: `npm install --include=dev && npm run build`
   - Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
4. Configure variables from sections 2.1 and 2.2.
5. Add custom domain (`www.distribuidorasis.com.mx`) and force HTTPS.
6. Keep rollback procedure ready:
   - Previous successful deployment ID identified.
   - Revert deploy from Railway history if smoke tests fail.

---

## 4) Cloudflare DNS + Domain

### 4.1 Authoritative DNS

- Keep flow: `AKKY (registrar) -> Cloudflare (DNS)`.
- Validate nameservers are delegated to Cloudflare.

### 4.2 App records

- `www` -> CNAME/A target from Railway.
- Apex (`@`) should either point directly to host or redirect to `www` (single canonical policy).

### 4.3 Resend records

Use a dedicated subdomain for email reputation isolation (`mail.distribuidorasis.com.mx`).

- SPF: one TXT SPF record per host (merge includes, do not duplicate).
- DKIM: add all selectors requested by Resend.
- DMARC: start with `p=none`, then harden later.

---

## 5) Supabase Authentication (OTP) Definitive URLs

In `Authentication -> URL Configuration` set:

- Site URL: `https://www.distribuidorasis.com.mx`
- Redirect URL: `http://localhost:8080/**`
- Redirect URL: `https://staging.distribuidorasis.com.mx/**`
- Redirect URL: `https://www.distribuidorasis.com.mx/**`

Security requirements:
- OTP-only admin flow (no password login for admin).
- No detailed errors that leak allowlist membership.

---

## 6) Supabase Edge Function `send-contact-email` (Production)

Function path: `supabase/functions/send-contact-email`.

### 6.1 Required function configuration

- `verify_jwt = false` (public contact form endpoint).
- Function secrets configured:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `CONTACT_EMAIL_TO`
  - `CONTACT_EMAIL_FROM`
  - `ALLOWED_ORIGINS`

### 6.2 Smoke test (email provider API)

```bash
curl -sS https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "'"$CONTACT_EMAIL_FROM"'",
    "to": ["'"$CONTACT_EMAIL_TO"'"],
    "subject": "Go-live validation - distribuidorasis",
    "html": "<p>Resend production setup validated.</p>"
  }'
```

Success criteria:
- response contains `id`,
- email arrives to `ventas@distribuidorasis.com.mx`.

### 6.3 Smoke test (app flow)

From `/contacto` submit valid form and verify:
- row inserted in `public.contact_requests`,
- email delivered by function.

---

## 7) Database and Migrations

Apply migrations in order from `supabase/migrations/`:

1. `001_initial_catalog_schema.sql`
2. `002_initial_rls_policies.sql`
3. `003_fix_profiles_self_select.sql`
4. `004_fix_profiles_policy_recursion.sql`
5. `005_products_name_unique.sql`
6. `006_product_images_gallery_rules.sql`
7. `007_whatsapp_cta_attempts.sql`
8. `008_profiles_module_permissions.sql`
9. `009_product_categories_pivot.sql`
10. `010_whatsapp_cta_reliability.sql`

`007` must be validated in production:
- `anon` can insert into `whatsapp_cta_attempts`,
- authenticated admin can select from `whatsapp_cta_attempts`.

`008` must be validated in production:
- `public.profiles.allowed_modules` accepts only `productos`, `categorias`, `conversion`.
- restricted admin profiles (e.g. `['conversion']`) can access only allowed admin modules.
- legacy admins with `allowed_modules = null` retain temporary full access until migration hardening is completed.

`009` must be validated in production:
- `product_categories` contains backfilled links from legacy `products.category_id`.
- `anon` can read only active product/category relationships.
- admin CRUD over `product_categories` works through authenticated profile guard.
- app queries use explicit relationship embeds to avoid ambiguous FK resolution.

`010` must be validated in production:
- `whatsapp_cta_attempts.event_id` is populated for legacy rows.
- unique index `whatsapp_cta_attempts_event_id_unique` exists and prevents duplicates.
- retry-safe inserts keep a single row per logical CTA attempt.

---

## 8) Storage and Legacy Image Migration

Bucket: `products`  
Accepted content types: `image/jpeg`, `image/png`, `image/webp`.

### 8.1 Migration script (idempotent)

Script file: `app/scripts/migrate-product-images.mjs`

Commands:

```bash
cd app
npm run images:migrate:dry-run
npm run images:migrate:apply
```

Behavior:
- maps `products.slug` to local file in `app/public/products`,
- uploads to `products/<product_id>/<slug>.<ext>`,
- inserts metadata in `product_images` (`storage_path`, `public_url`, `sort_order`, `is_cover`),
- skips rows already migrated by `storage_path`,
- applies best-effort rollback by removing uploaded object if DB insert fails.

Required env vars for script:
- `VITE_SUPABASE_URL` (or `SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`

Execution status (production):
- ✅ Migration executed successfully (`uploaded=46`, `inserted_rows=46`, `failures=0`).

---

## 9) Cloudflare Tunnel for Local Staging

Goal: expose local app as `https://staging.distribuidorasis.com.mx`.

### 9.1 One-time setup

1. Install `cloudflared`.
2. Authenticate and pin the Cloudflare account/profile:
   - `cloudflared tunnel login`
   - `export TUNNEL_ORIGIN_CERT="/Users/<you>/.cloudflared/profiles/distribuidorasis/cert.pem"`
3. Create tunnel:
   - `cloudflared tunnel create distribuidorasis-staging`
4. Create DNS CNAME (only required UI-side task in Cloudflare if not created by CLI):
   - `staging` -> `<tunnel-id>.cfargotunnel.com`
5. Keep tunnel config in repo:
   - `cloudflared/distribuidorasis-staging.yml`
   - ingress target: `http://localhost:8080`

### 9.2 Daily local workflow (app + tunnel)

Use repository scripts from project root:

```bash
./scripts/start-dev.sh
./scripts/status-dev.sh
./scripts/stop-dev.sh
```

Notes:
- `start-dev.sh` starts Vite in `app/` and the Cloudflare tunnel in background.
- `status-dev.sh` reports process health and local/staging URL availability.
- `stop-dev.sh` gracefully stops both services.

Validation:
- app opens from public staging URL,
- OTP redirects/callbacks work in staging domain,
- footer shows runtime indicator (`production` / `staging (local)` / `local`) and git short SHA.

---

## 10) Anti-abuse Baseline (Contact + WhatsApp)

Current state:
- No application-level rate limiter in `send-contact-email`.
- Protection currently depends on platform/provider defaults.

Mandatory mitigations before/at go-live:
1. Restrict CORS allowed origins to local/staging/prod app domains.
2. Add edge/proxy controls (Cloudflare WAF managed rules + bot/challenge baseline).
3. Introduce CAPTCHA or equivalent challenge in public contact flow (next hardening task).
4. Monitor spikes in `contact_requests` and `whatsapp_cta_attempts`.

Operational decision (2026-03-13):
- Baseline hardening tasks remain pending during week-1 observation.
- Keep active monitoring in place and prioritize mitigation rollout if abnormal traffic appears.

---

## 11) Go-live Checklist (Execution Order)

### 11.1 Pre-deploy

- [x] Railway project configured with production variables.
- [x] Cloudflare DNS web records pointing to Railway.
- [x] Resend domain status is `Verified`.
- [x] Supabase Auth URLs updated for staging and production.
- [x] Migration `007_whatsapp_cta_attempts.sql` applied in production.
- [ ] Migration `008_profiles_module_permissions.sql` applied in production.
- [ ] Migration `009_product_categories_pivot.sql` applied in production.
- [ ] Migration `010_whatsapp_cta_reliability.sql` applied in production.
- [x] Legacy image migration executed to Supabase Storage (`app/public/products` -> `product_images`).

### 11.2 Release validation

- [x] Public catalog works on production domain.
- [x] Admin OTP login works on production domain.
- [x] `/contacto` creates DB record + sends email.
- [x] WhatsApp CTA opens and logs attempt.
- [x] `/admin/conversion` shows metrics and filtered table.

### 11.3 Post-go-live (first 24h)

- [ ] Review Railway logs every 2-4 hours.
- [ ] Review Supabase Function logs for `send-contact-email`.
- [ ] Review Resend delivery/rejection metrics.
- [ ] Monitor DB inserts rate for suspicious spikes.
- [ ] Confirm no auth redirect/callback errors from production URLs.

---

## 12) One-command Local Bootstrap

```bash
cd app && cp .env.example .env.local && npm install
cd .. && ./scripts/start-dev.sh
```
