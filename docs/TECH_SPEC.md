# Technical Specification

> **Project:** distribuidorasis
> **Last updated:** 2026-03-10

---

## Stack

| Layer | Technology | Version |
|:------|:-----------|:--------|
| **Framework** | React + Vite | React 18 / Vite 5 |
| **Database** | Supabase (PostgreSQL) | Managed |
| **UI** | TailwindCSS + shadcn/ui | Tailwind 3 |
| **Language** | TypeScript | 5.x |
| **Hosting** | Railway (preferred) / Netlify | — |
| **Auth** | Supabase Auth (Email OTP) | — |
| **State/Data** | TanStack Query + Supabase JS | Query 5 / supabase-js 2 |

---

## Data Model

### Core Tables

#### `profiles`

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `email` | `text` | UNIQUE, NOT NULL | Admin account email |
| `role` | `text` | NOT NULL, check in (`admin`) | Authorization role |
| `is_active` | `boolean` | NOT NULL, default `true` | Soft activation flag |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |

#### `categories`

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `name` | `text` | UNIQUE, NOT NULL | Category display name |
| `slug` | `text` | UNIQUE, NOT NULL | URL-safe identifier |
| `sort_order` | `int` | NOT NULL, default `0` | Ordering in UI filters |
| `is_active` | `boolean` | NOT NULL, default `true` | Visible in catalog |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |

#### `products`

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `category_id` | `uuid` | FK -> `categories.id`, NOT NULL | Product category |
| `name` | `text` | NOT NULL | Commercial product name |
| `slug` | `text` | UNIQUE, NOT NULL | URL slug for detail route |
| `short_description` | `text` | NULL | Catalog summary |
| `description` | `text` | NULL | Full product details |
| `specs_json` | `jsonb` | NOT NULL, default `'{}'::jsonb` | Structured specs |
| `is_active` | `boolean` | NOT NULL, default `true` | Publishes product |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

#### `product_images`

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `product_id` | `uuid` | FK -> `products.id`, NOT NULL | Owner product |
| `storage_path` | `text` | NOT NULL | Supabase Storage object path |
| `public_url` | `text` | NOT NULL | Resolved URL for rendering |
| `alt_text` | `text` | NULL | Accessibility description |
| `sort_order` | `int` | NOT NULL, default `0` | Image order in carousel |
| `is_cover` | `boolean` | NOT NULL, default `false` | Marks default thumbnail |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |

#### `contact_requests`

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `full_name` | `text` | NOT NULL | Requester name |
| `company` | `text` | NULL | Company name |
| `phone` | `text` | NOT NULL | Contact phone |
| `email` | `text` | NOT NULL | Contact email |
| `request_type` | `text` | NOT NULL | Requirement category |
| `message` | `text` | NOT NULL | Request content |
| `source` | `text` | NOT NULL, default `'web_form'` | Channel attribution |
| `status` | `text` | NOT NULL, default `'new'` | Workflow state |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |

### Relationships

- `products.category_id` -> `categories.id` (FK, ON DELETE RESTRICT)
- `product_images.product_id` -> `products.id` (FK, ON DELETE CASCADE)
- `profiles.id` -> `auth.users.id` (FK logical by same UUID key)

---

## Authentication

- **Method:** One-time code (OTP) via email (Supabase Auth).
- **Provider:** Supabase Auth
- **Session management:** Supabase session tokens in secure storage, refreshed by SDK.
- **Protected routes:** `/admin`, `/admin/*`, server mutations to products/categories/images.
- **Identity rule:** Only emails allowlisted in `profiles` with role `admin` can access admin actions.

---

## Security (RLS Policies)

| Table | Role | SELECT | INSERT | UPDATE | DELETE | Policy Logic |
|:------|:-----|:-------|:-------|:-------|:-------|:-------------|
| `categories` | anon | Yes (`is_active=true`) | No | No | No | Catalog read-only for public users |
| `products` | anon | Yes (`is_active=true`) | No | No | No | Public listing only active products |
| `product_images` | anon | Yes | No | No | No | Public can read image metadata for active products |
| `contact_requests` | anon | No | Yes | No | No | Public can create lead requests only |
| `categories` | authenticated admin | Yes | Yes | Yes | Yes | `exists(select 1 from profiles p where p.id=auth.uid() and p.role='admin' and p.is_active=true)` |
| `products` | authenticated admin | Yes | Yes | Yes | Yes | Same admin policy check |
| `product_images` | authenticated admin | Yes | Yes | Yes | Yes | Same admin policy check |
| `contact_requests` | authenticated admin | Yes | Yes | Yes | Yes | Admin can manage lead pipeline |
| `profiles` | anon | No | No | No | No | Not visible to anonymous users |
| `profiles` | authenticated admin | Yes | No | Limited | No | Admin can view profiles and update activation state |

---

## Architecture Decisions (ADRs)

### ADR-001: Keep React + Vite and add Supabase backend

- **Context:** Existing prototype is already implemented and validated in React + Vite.
- **Decision:** Preserve current frontend stack and integrate Supabase (DB, Auth, Storage, RLS) instead of full framework migration.
- **Consequences:** Faster time-to-value and lower rewrite risk; requires explicit route guards and API service layer in current architecture.

### ADR-002: OTP-only admin authentication for MVP

- **Context:** Admin module needs real security with minimal friction and no password reset burden.
- **Decision:** Use Supabase Auth with email OTP code flow and admin allowlist in `profiles`.
- **Consequences:** Simplifies onboarding and credential management; depends on reliable transactional email delivery.

### ADR-003: Normalize images in dedicated table + Storage bucket

- **Context:** Product gallery must support multiple ordered images and cover image semantics.
- **Decision:** Store images metadata in `product_images` and binary assets in Supabase Storage bucket `products`.
- **Consequences:** Enables reusable carousel across list/detail/admin; introduces upload lifecycle management (replace/delete/reorder).

---

## Server/Client Strategy

- **Default:** Data access goes through dedicated service layer (`src/lib/api`) that abstracts Supabase client interactions.
- **Client Components** are used for interactive catalog filters, carousels, OTP form UX, and admin panel actions.
- **Server-side functions** (edge/serverless) are used for email dispatch from contact form to `ventas@distribuidorasis.com.mx`.
- **Classification convention:**
  - `[CC]` — Client Component (interactivity, `useState`, `useEffect`)
  - `[API]` — Backend endpoint/function (validated mutation/integration)
  - `[DAL]` — Data access layer service (Supabase reads/writes)

---

## Project Structure

```
src/
├── components/              # Shared UI components
│   ├── admin/               # Admin-specific managers
│   └── ui/                  # Base UI primitives
├── lib/
│   ├── supabase/            # Supabase client, auth and storage helpers
│   ├── api/                 # [DAL] data services for products/contact/admin
│   └── utils.ts             # General utilities
├── pages/                   # Route pages (catalog, product, contacto, admin)
├── types/                   # Domain and API contracts
└── test/                    # Integration and component tests

supabase/
├── migrations/              # SQL migrations and RLS policies
└── seed.sql                 # Development seed data

functions/
└── send-contact-email/      # [API] email delivery endpoint
```
