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
  InsertProductCategory,
  InsertProduct,
  InsertProductImage,
  Product,
  ProductCategory,
  ProductImage,
  Profile,
  WhatsAppCtaAttempt,
  UpdateProduct,
  UpdateProductImage,
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

describe("HU-2.2 RLS hardening: profiles recursion fix", () => {
  const sql = readFileSync(
    resolve(
      __dirname,
      "../../..",
      "supabase/migrations/004_fix_profiles_policy_recursion.sql",
    ),
    "utf-8",
  );

  it("drops recursive profiles policies from migration 002", () => {
    expect(sql).toMatch(/drop policy if exists "profiles_admin_select" on public\.profiles/i);
    expect(sql).toMatch(/drop policy if exists "profiles_admin_update" on public\.profiles/i);
  });

  it("creates safe authenticated self-select policy on profiles", () => {
    expect(sql).toMatch(/create policy "profiles_self_select"/i);
    expect(sql).toMatch(/for select/i);
    expect(sql).toMatch(/to authenticated/i);
    expect(sql).toMatch(/using \(id = auth\.uid\(\)\)/i);
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
      allowed_modules: null,
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

  it("Database type contains public.product_categories", () => {
    const row: ProductCategory = {
      product_id: "prod-uuid",
      category_id: "cat-uuid",
      created_at: "2026-03-18",
    };
    expect(row.product_id).toBe("prod-uuid");
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

  it("Database type contains public.whatsapp_cta_attempts", () => {
    const row: WhatsAppCtaAttempt = {
      id: "uuid",
      event_id: "evt-123",
      source: "/contacto",
      context_type: "contact_card",
      product_slug: null,
      product_name: null,
      prefilled_message: "Hola, me interesa cotizar.",
      opened_successfully: true,
      created_at: "2026-03-19T12:00:00.000Z",
    };
    expect(row.event_id).toBe("evt-123");
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

  it("InsertProductCategory requires product_id and category_id", () => {
    const insert: InsertProductCategory = {
      product_id: "prod-uuid",
      category_id: "cat-uuid",
    };
    expect(insert.category_id).toBe("cat-uuid");
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
      allowed_modules: ["productos", "categorias", "conversion"],
      created_at: "2026-01-01",
    };
    expect(profile.role).toBe("admin");
  });
});

// ──────────────────────────────────────────────
// HU-3.1 Scenario 1: SQL migration 006 — gallery business rules
// ──────────────────────────────────────────────
describe("HU-3.1 Scenario 1: SQL migration 006 — product_images gallery rules", () => {
  const sql = readFileSync(
    resolve(__dirname, "../../..", "supabase/migrations/006_product_images_gallery_rules.sql"),
    "utf-8",
  );

  it("normalizes existing sort_orders before adding constraints", () => {
    expect(sql).toMatch(/row_number\(\) over \(partition by product_id/i);
  });

  it("adds non-negative check constraint on sort_order", () => {
    expect(sql).toMatch(/product_images_sort_order_non_negative/i);
    expect(sql).toMatch(/sort_order >= 0/i);
  });

  it("adds not-empty check constraint on public_url", () => {
    expect(sql).toMatch(/product_images_public_url_not_empty/i);
    expect(sql).toMatch(/length\(trim\(public_url\)\) > 0/i);
  });

  it("adds not-empty check constraint on storage_path", () => {
    expect(sql).toMatch(/product_images_storage_path_not_empty/i);
    expect(sql).toMatch(/length\(trim\(storage_path\)\) > 0/i);
  });

  it("creates unique index for (product_id, sort_order) pair", () => {
    expect(sql).toMatch(/product_images_product_sort_order_unique/i);
    expect(sql).toMatch(/on public\.product_images\(product_id, sort_order\)/i);
  });

  it("creates partial unique index for single cover image per product", () => {
    expect(sql).toMatch(/product_images_single_cover_per_product/i);
    expect(sql).toMatch(/where is_cover = true/i);
  });
});

describe("HU-5.1 Scenario 1: SQL migration 008 — profiles module permissions", () => {
  const sql = readFileSync(
    resolve(__dirname, "../../..", "supabase/migrations/008_profiles_module_permissions.sql"),
    "utf-8",
  );

  it("adds allowed_modules column to profiles", () => {
    expect(sql).toMatch(/add column if not exists allowed_modules text\[\] null/i);
  });

  it("enforces valid module values via check constraint", () => {
    expect(sql).toMatch(/profiles_allowed_modules_valid/i);
    expect(sql).toMatch(/array\['productos','categorias','conversion'\]::text\[\]/i);
  });
});

describe("HU-5.3 Scenario 1: SQL migration 009 — product_categories pivot + RLS", () => {
  const sql = readFileSync(
    resolve(__dirname, "../../..", "supabase/migrations/009_product_categories_pivot.sql"),
    "utf-8",
  );

  it("creates product_categories table with composite primary key", () => {
    expect(sql).toMatch(/create table if not exists public\.product_categories/i);
    expect(sql).toMatch(/primary key \(product_id, category_id\)/i);
  });

  it("backfills pivot table from legacy products.category_id", () => {
    expect(sql).toMatch(/insert into public\.product_categories/i);
    expect(sql).toMatch(/select p\.id, p\.category_id/i);
  });

  it("enables RLS and defines anon/admin policies", () => {
    expect(sql).toMatch(/alter table public\.product_categories enable row level security/i);
    expect(sql).toMatch(/product_categories_anon_select_active/i);
    expect(sql).toMatch(/product_categories_admin_all/i);
  });
});

describe("HU-5.6 Scenario 1: SQL migration 010 — WhatsApp CTA reliability", () => {
  const sql = readFileSync(
    resolve(__dirname, "../../..", "supabase/migrations/010_whatsapp_cta_reliability.sql"),
    "utf-8",
  );

  it("adds event_id column to whatsapp_cta_attempts", () => {
    expect(sql).toMatch(/add column if not exists event_id text/i);
  });

  it("backfills event_id from legacy id", () => {
    expect(sql).toMatch(/set event_id = id::text/i);
    expect(sql).toMatch(/where event_id is null/i);
  });

  it("creates unique index for event_id", () => {
    expect(sql).toMatch(/whatsapp_cta_attempts_event_id_unique/i);
    expect(sql).toMatch(/on public\.whatsapp_cta_attempts \(event_id\)/i);
  });
});

// ──────────────────────────────────────────────
// HU-3.1 TypeScript types — InsertProductImage / UpdateProductImage
// ──────────────────────────────────────────────
describe("HU-3.1 TypeScript type contract — product image insert/update types", () => {
  it("InsertProductImage requires product_id, storage_path, public_url", () => {
    const insert: InsertProductImage = {
      product_id: "prod-uuid",
      storage_path: "products/casco.jpg",
      public_url: "https://cdn.example.com/casco.jpg",
    };
    expect(insert.product_id).toBe("prod-uuid");
  });

  it("InsertProductImage allows optional sort_order and is_cover", () => {
    const insert: InsertProductImage = {
      product_id: "prod-uuid",
      storage_path: "products/casco.jpg",
      public_url: "https://cdn.example.com/casco.jpg",
      sort_order: 0,
      is_cover: true,
      alt_text: "Casco industrial blanco",
    };
    expect(insert.is_cover).toBe(true);
  });

  it("UpdateProductImage allows partial updates (sort_order only)", () => {
    const update: UpdateProductImage = { sort_order: 2 };
    expect(update.sort_order).toBe(2);
  });

  it("UpdateProductImage allows toggling is_cover", () => {
    const update: UpdateProductImage = { is_cover: false };
    expect(update.is_cover).toBe(false);
  });
});
