# Setup & Configuration Guide

> **Project:** [PROJECT_NAME]
> **Last updated:** [DATE]
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
| _example:_ `DATABASE_URL` | Secret | Hosting provider dashboard | HU-N.M |

<!-- Add rows as stories introduce new variables. -->

---

## 2. External Services

> Document every third-party service or cloud resource the project depends on.
> Include account setup steps and relevant dashboard URLs.

### 2.1 [Service Name]

- **Purpose:** [what it provides]
- **Dashboard:** [URL]
- **Setup steps:**
  1. [Step 1]
  2. [Step 2]
- **Added by:** HU-N.M

<!-- Duplicate this subsection for each external service. -->

---

## 3. Database

> Document the database engine, how to run migrations, schema details, security
> policies, and seed data.

### 3.1 Engine & Connection

- **Engine:** [e.g., PostgreSQL, MySQL, SQLite]
- **Connection:** [how to connect — local, cloud dashboard, CLI]

### 3.2 Migrations

> List migration files in execution order.

| Migration | Description | Added by |
|:----------|:------------|:---------|
| _example:_ `001_initial_schema.sql` | Creates core tables | HU-N.M |

### 3.3 Schema Details

<!-- Document tables, columns, constraints, and indexes as they are created. -->

### 3.4 Security Policies

<!-- Document RLS policies, RBAC rules, or other database-level access control. -->

### 3.5 Seed Data (Development)

<!-- Reference seed scripts for local development, if any. -->

---

## 4. Authentication

> Document the authentication method, provider configuration, and relevant files.

- **Method:** [e.g., Email OTP, OAuth, JWT, Session-based]
- **Provider:** [e.g., Supabase Auth, Auth0, NextAuth, custom]

### 4.1 Provider Configuration

<!-- Step-by-step setup for the auth provider (redirect URLs, allowed origins, etc.) -->

### 4.2 Auth Flow Summary

<!-- Describe the authentication flow from the user's perspective. -->

### 4.3 Files Involved

| File | Role |
|:-----|:-----|
| _example:_ `src/middleware.ts` | Session refresh and route protection |

---

## 5. Storage

> Document file storage configuration (buckets, CDN, upload limits, policies).

### 5.1 [Bucket / Container Name]

- **Purpose:** [what is stored]
- **Public access:** Yes / No
- **Size limit:** [e.g., 5 MB]
- **Allowed types:** [e.g., image/jpeg, image/png]
- **Policies:** [read/write access rules]
- **Added by:** HU-N.M

<!-- Duplicate this subsection for each storage bucket. -->

---

## 6. Application Configuration

> Document hardcoded values, feature flags, or configuration constants that
> must be customized before production.

| Constant / Setting | Current Value | Action Required |
|:-------------------|:-------------|:----------------|
| _example:_ `APP_NAME` | `"My App"` | Confirm the production name |

---

## 7. Quick Start Checklist

### First-time setup (development)

```
# 1. Clone and install
git clone <repo-url>
cd [PROJECT_NAME]
# [install dependencies command]

# 2. Environment variables
# [copy and configure env file]

# 3. Run the app
# [start command]
```

### Infrastructure checklist

- [ ] [Service/resource 1 configured]
- [ ] [Service/resource 2 configured]
- [ ] [Database migrations executed]
- [ ] [Auth provider configured]
- [ ] [Storage buckets created]

### Production deployment

- [ ] [Hosting platform connected]
- [ ] [Environment variables set in production]
- [ ] [Auth redirect URLs updated for production domain]
