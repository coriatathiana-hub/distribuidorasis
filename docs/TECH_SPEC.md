# Technical Specification

> **Project:** distribuidorasis
> **Last updated:** 2026-03-10

---

## Stack

| Layer | Technology | Version |
|:------|:-----------|:--------|
| **Framework** | Next.js (App Router) | [version] |
| **Database** | Supabase (PostgreSQL) | [version] |
| **UI** | TailwindCSS | [version] |
| **Language** | TypeScript | [version] |
| **Hosting** | Vercel | — |
| **Auth** | Supabase Auth | — |

---

## Data Model

### Core Tables

#### [table_name_1]

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| [column] | [type] | [constraints] | [description] |

#### [table_name_2]

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| [column] | [type] | [constraints] | [description] |

### Relationships

- `[table_1].[column]` → `[table_2].[column]` (FK, ON DELETE CASCADE)

---

## Authentication

- **Method:** [OTP via Email / OAuth / Magic Link / etc.]
- **Provider:** Supabase Auth
- **Session management:** [Server-side cookies via `@supabase/ssr`]
- **Protected routes:** [List of routes that require authentication]

---

## Security (RLS Policies)

| Table | Role | SELECT | INSERT | UPDATE | DELETE | Policy Logic |
|:------|:-----|:-------|:-------|:-------|:-------|:-------------|
| [table] | authenticated | Yes | Yes | Own | Own | `auth.uid() = user_id` |
| [table] | anon | No | No | No | No | — |

---

## Architecture Decisions (ADRs)

### ADR-001: [Decision Title]

- **Context:** [Why this decision was needed]
- **Decision:** [What was decided]
- **Consequences:** [Trade-offs and implications]

---

## Server/Client Strategy

- **Default:** All data logic is **Server-side** (Server Components + Server Actions).
- **Client Components** are used only when: interactive state, browser APIs, or real-time subscriptions are needed.
- **Classification convention:**
  - `[SC]` — Server Component (data fetching, rendering)
  - `[CC]` — Client Component (interactivity, `useState`, `useEffect`)
  - `[SA]` — Server Action (mutations, form submissions)

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth-related routes
│   ├── (dashboard)/        # Protected routes
│   └── layout.tsx          # Root layout
├── components/             # Shared UI components
│   ├── ui/                 # Base UI primitives
│   └── [feature]/          # Feature-specific components
├── lib/                    # Utilities and helpers
│   ├── supabase/           # Supabase client setup
│   └── utils.ts            # General utilities
├── types/                  # TypeScript type definitions
└── tests/                  # Test files
```
