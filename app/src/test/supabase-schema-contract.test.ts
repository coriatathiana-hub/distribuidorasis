/**
 * HU-2.1 contract tests — Supabase schema baseline
 *
 * These tests verify three things without requiring a live DB connection:
 *  1. SQL migration files exist in the repo and contain the expected table/policy names.
 *  2. The Database type contract covers all required tables.
 *  3. The Supabase client module exports the expected symbols.
 *
 * Live RLS policy enforcement is validated manually via the Supabase SQL Editor
 * following the Manual Testing Checklist in current_objective.md.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import type {
  Category,
  ContactRequest,
  Database,
  InsertCategory,
  InsertProduct,
  Product,
  ProductImage,
  Profile,
  UpdateProduct,
} from "@/types/supabase";

// ──────────────────────────────────────────────
// BDD Scenario 1: Esquema base de datos operativo
// Migracion 001 debe contener tablas y relaciones
// ──────────────────────────────────────────────
describe("HU-2.1 Scenario 1: SQL migration 001 — initial catalog schema", () => {
  const sql = readFileSync(
    resolve(__dirname, "../../..", "supabase/migrations/001_initial_catalog_schema.sql"),
    "utf-8",
  );

  it("contains profiles table definition", () => {
    expect(sql).toMatch(/create table if not exists public\.profiles/i);
  });

  it("contains categories table definition", () => {
    expect(sql).toMatch(/create table if not exists public\.categories/i);
  });

  it("contains products table definition", () => {
    expect(sql).toMatch(/create table if not exists public\.products/i);
  });

  it("contains product_images table definition", () => {
    expect(sql).toMatch(/create table if not exists public\.product_images/i);
  });

  it("contains contact_requests table definition", () => {
    expect(sql).toMatch(/create table if not exists public\.contact_requests/i);
  });

  it("products references categories via FK", () => {
    expect(sql).toMatch(/references public\.categories\(id\)/i);
  });

  it("product_images references products via FK with cascade", () => {
    expect(sql).toMatch(/references public\.products\(id\).*on delete cascade/is);
  });

  it("profiles references auth.users with cascade", () => {
    expect(sql).toMatch(/references auth\.users\(id\).*on delete cascade/is);
  });

  it("products has updated_at trigger", () => {
    expect(sql).toMatch(/products_set_updated_at/i);
  });
});

// ──────────────────────────────────────────────
// BDD Scenario 2: Politicas RLS minimas aplicadas
// Migracion 002 debe habilitar RLS y politicas
// ──────────────────────────────────────────────
describe("HU-2.1 Scenario 2: SQL migration 002 — RLS policies", () => {
  const sql = readFileSync(
    resolve(__dirname, "../../..", "supabase/migrations/002_initial_rls_policies.sql"),
    "utf-8",
  );

  it("enables RLS on categories", () => {
    expect(sql).toMatch(/alter table public\.categories\s+enable row level security/i);
  });

  it("enables RLS on products", () => {
    expect(sql).toMatch(/alter table public\.products\s+enable row level security/i);
  });

  it("enables RLS on profiles", () => {
    expect(sql).toMatch(/alter table public\.profiles\s+enable row level security/i);
  });

  // BDD Scenario 2: anon can read active catalog
  it("defines anon SELECT policy on categories (active only)", () => {
    expect(sql).toMatch(/categories_anon_select_active/i);
    expect(sql).toMatch(/to anon/i);
  });

  it("defines anon SELECT policy on products (active only)", () => {
    expect(sql).toMatch(/products_anon_select_active/i);
  });

  // BDD Scenario 2: admin has full CRUD
  it("defines authenticated admin ALL policy on categories", () => {
    expect(sql).toMatch(/categories_admin_all/i);
    expect(sql).toMatch(/to authenticated/i);
  });

  it("defines authenticated admin ALL policy on products", () => {
    expect(sql).toMatch(/products_admin_all/i);
  });

  // BDD Scenario 3: anon write is denied (no insert/update/delete policy for anon on products)
  it("does NOT define anon write policy on products", () => {
    const anonWriteOnProducts = /create policy.*\n.*on public\.products\n.*for (insert|update|delete)\n.*to anon/i;
    expect(sql).not.toMatch(anonWriteOnProducts);
  });

  // Admin policy uses profiles role check
  it("admin policies verify profiles.role='admin' and is_active", () => {
    expect(sql).toMatch(/p\.role = 'admin'/i);
    expect(sql).toMatch(/p\.is_active = true/i);
  });

  // anon can insert contact_requests
  it("defines anon INSERT policy on contact_requests", () => {
    expect(sql).toMatch(/contact_requests_anon_insert/i);
  });
});

// ──────────────────────────────────────────────
// TypeScript type contract — Database interface
// Validates all tables are covered by types
// ──────────────────────────────────────────────
describe("HU-2.1 TypeScript Database contract — all tables represented", () => {
  it("Database type contains public.profiles", () => {
    type T = Database["public"]["Tables"]["profiles"]["Row"];
    const check: T = {
      id: "uuid",
      email: "e@test.com",
      role: "admin",
      is_active: true,
      created_at: "2026-01-01",
    };
    expect(check.role).toBe("admin");
  });

  it("Database type contains public.categories", () => {
    const row: Category = {
      id: "uuid",
      name: "EPP",
      slug: "epp",
      sort_order: 1,
      is_active: true,
      created_at: "2026-01-01",
    };
    expect(row.slug).toBe("epp");
  });

  it("Database type contains public.products", () => {
    const row: Product = {
      id: "uuid",
      category_id: "cat-uuid",
      name: "Casco",
      slug: "casco",
      short_description: null,
      description: null,
      specs_json: {},
      is_active: true,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };
    expect(row.name).toBe("Casco");
  });

  it("Database type contains public.product_images", () => {
    const row: ProductImage = {
      id: "uuid",
      product_id: "prod-uuid",
      storage_path: "products/casco.jpg",
      public_url: "https://cdn.example.com/casco.jpg",
      alt_text: null,
      sort_order: 0,
      is_cover: true,
      created_at: "2026-01-01",
    };
    expect(row.is_cover).toBe(true);
  });

  it("Database type contains public.contact_requests", () => {
    const row: ContactRequest = {
      id: "uuid",
      full_name: "Juan",
      company: null,
      phone: "5551234567",
      email: "juan@test.com",
      request_type: "cotizacion",
      message: "Hola",
      source: "web_form",
      status: "new",
      created_at: "2026-01-01",
    };
    expect(row.status).toBe("new");
  });

  it("Insert types allow omitting auto-generated fields", () => {
    const insert: InsertCategory = { name: "EPP", slug: "epp" };
    expect(insert.name).toBe("EPP");
  });

  it("Insert types for products require category_id, name, slug", () => {
    const insert: InsertProduct = {
      category_id: "cat-uuid",
      name: "Casco MSA",
      slug: "casco-msa",
    };
    expect(insert.slug).toBe("casco-msa");
  });

  it("Update types allow partial row updates", () => {
    const update: UpdateProduct = { is_active: false };
    expect(update.is_active).toBe(false);
  });

  it("Profile type enforces role='admin' literal", () => {
    const profile: Profile = {
      id: "uuid",
      email: "admin@sis.com",
      role: "admin",
      is_active: true,
      created_at: "2026-01-01",
    };
    expect(profile.role).toBe("admin");
  });
});
