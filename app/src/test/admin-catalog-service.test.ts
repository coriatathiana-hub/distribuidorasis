/**
 * HU-2.3 — Contract tests for admin-catalog-service DAL
 * Validates: data mapping, error code translation, query construction.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as service from "@/lib/api/admin-catalog-service";

// ── Supabase mock helpers ─────────────────────────────────────────────────────

type QueryResult = { data: unknown; error: { message: string; code?: string } | null };

/** Creates a thenable chainable mock that resolves to `result`. */
function makeChain(result: QueryResult) {
  let chain: Record<string, unknown>;
  chain = {
    select: vi.fn(() => chain),
    order: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    ilike: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
    then: (onFulfilled: (v: QueryResult) => unknown) =>
      Promise.resolve(result).then(onFulfilled),
    catch: (onRejected: (e: unknown) => unknown) =>
      Promise.resolve(result).catch(onRejected),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

// Lazy import so mock is applied first
const getSupabase = async () =>
  (await import("@/lib/supabase/client")).supabase;

// ── Categories ────────────────────────────────────────────────────────────────

describe("listCategories", () => {
  it("returns data array on success", async () => {
    const cats = [{ id: "1", name: "EPP", slug: "epp", sort_order: 1, is_active: true, created_at: "2024-01-01" }];
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(makeChain({ data: cats, error: null }) as ReturnType<typeof sb.from>);

    const result = await service.listCategories();
    expect(result).toEqual(cats);
  });

  it("throws Error on Supabase error", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(makeChain({ data: null, error: { message: "DB down" } }) as ReturnType<typeof sb.from>);

    await expect(service.listCategories()).rejects.toThrow("DB down");
  });
});

describe("createCategory", () => {
  const payload = { name: "EPP", slug: "epp" };

  it("returns created category on success", async () => {
    const cat = { id: "abc", name: "EPP", slug: "epp", sort_order: 0, is_active: true, created_at: "2024-01-01" };
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(makeChain({ data: cat, error: null }) as ReturnType<typeof sb.from>);

    const result = await service.createCategory(payload);
    expect(result).toEqual(cat);
  });

  it("throws friendly message on unique constraint (23505)", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "duplicate key", code: "23505" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.createCategory(payload)).rejects.toThrow(
      "Ya existe una categoría con ese nombre o slug."
    );
  });
});

describe("updateCategory", () => {
  it("throws friendly message on unique constraint (23505)", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "duplicate key", code: "23505" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.updateCategory("id-1", { slug: "epp" })).rejects.toThrow(
      "Ya existe una categoría con ese nombre o slug."
    );
  });
});

// ── Products ──────────────────────────────────────────────────────────────────

describe("listProducts", () => {
  it("maps categories.name to category_name and removes categories key", async () => {
    const raw = [
      {
        id: "p1",
        category_id: "c1",
        name: "Casco MSA",
        slug: "casco-msa",
        short_description: null,
        description: null,
        specs_json: {},
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        categories: { name: "EPP" },
      },
    ];
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(makeChain({ data: raw, error: null }) as ReturnType<typeof sb.from>);

    const result = await service.listProducts();
    expect(result[0].category_name).toBe("EPP");
    expect(result[0]).not.toHaveProperty("categories");
  });

  it("returns empty array when data is null", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>);

    const result = await service.listProducts();
    expect(result).toEqual([]);
  });
});

describe("createProduct", () => {
  const payload = { name: "Casco", slug: "casco", category_id: "c1" };

  it("throws friendly message on unique constraint (23505)", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "duplicate key", code: "23505" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.createProduct(payload)).rejects.toThrow(
      "Ya existe un producto con ese nombre o slug."
    );
  });
});

// ── Delete ────────────────────────────────────────────────────────────────────

describe("deleteProduct", () => {
  it("resolves without error on successful delete", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>);

    await expect(service.deleteProduct("p-1")).resolves.toBeUndefined();
  });

  it("throws Error when Supabase returns an error", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "RLS denied" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.deleteProduct("p-1")).rejects.toThrow("RLS denied");
  });
});

describe("deleteCategory", () => {
  it("resolves without error on successful delete", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>);

    await expect(service.deleteCategory("c-1")).resolves.toBeUndefined();
  });

  it("throws actionable message on FK violation (23503 — category has products)", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({
        data: null,
        error: { message: "fk constraint", code: "23503" },
      }) as ReturnType<typeof sb.from>
    );

    await expect(service.deleteCategory("c-1")).rejects.toThrow(
      "No se puede eliminar la categoría porque tiene productos asignados."
    );
  });

  it("throws generic Error for other Supabase errors", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "DB error" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.deleteCategory("c-1")).rejects.toThrow("DB error");
  });
});
