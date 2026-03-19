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
  // Closures capture `chain` by reference, so self-reference works at call time.
  const chain: Record<string, unknown> = {
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
  supabase: {
    from: vi.fn(),
    storage: { from: vi.fn() },
    auth: { getSession: vi.fn() },
  },
}));

// Lazy import so mock is applied first
const getSupabase = async () =>
  (await import("@/lib/supabase/client")).supabase;

type StorageChain = { remove: ReturnType<typeof vi.fn> };
type StorageUploadChain = {
  upload: ReturnType<typeof vi.fn>;
  getPublicUrl: ReturnType<typeof vi.fn>;
};

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
  it("maps pivot categories to category_name and category_ids", async () => {
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
        legacy_category: { name: "EPP" },
        product_categories: [
          { category_id: "c1", categories: { name: "EPP" } },
          { category_id: "c2", categories: { name: "Altura" } },
        ],
      },
    ];
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(makeChain({ data: raw, error: null }) as ReturnType<typeof sb.from>);

    const result = await service.listProducts();
    expect(result[0].category_name).toBe("EPP");
    expect(result[0].category_ids).toEqual(["c1", "c2"]);
    expect(result[0].category_names).toEqual(["EPP", "Altura"]);
  });

  it("returns empty array when data is null", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>);

    const result = await service.listProducts();
    expect(result).toEqual([]);
  });
});

describe("createProduct", () => {
  const payload = { name: "Casco", slug: "casco", category_ids: ["c1"] };

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

// ── Product Images ─────────────────────────────────────────────────────────────
// BDD HU-3.1 Scenario 1: images are stored and retrieved in sort_order

describe("listProductImages", () => {
  const images = [
    { id: "i1", product_id: "p1", storage_path: "products/a.jpg", public_url: "https://cdn/a.jpg", alt_text: null, sort_order: 0, is_cover: true, created_at: "2026-01-01" },
    { id: "i2", product_id: "p1", storage_path: "products/b.jpg", public_url: "https://cdn/b.jpg", alt_text: null, sort_order: 1, is_cover: false, created_at: "2026-01-01" },
  ];

  it("returns images ordered by sort_order ascending", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: images, error: null }) as ReturnType<typeof sb.from>
    );

    const result = await service.listProductImages("p1");
    expect(result).toHaveLength(2);
    expect(result[0].sort_order).toBe(0);
    expect(result[1].sort_order).toBe(1);
  });

  it("returns empty array when no images exist", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>
    );

    const result = await service.listProductImages("p1");
    expect(result).toEqual([]);
  });

  it("throws Error on Supabase error", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "connection lost" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.listProductImages("p1")).rejects.toThrow("connection lost");
  });
});

describe("addProductImage", () => {
  const payload = {
    product_id: "p1",
    storage_path: "products/casco.jpg",
    public_url: "https://cdn/casco.jpg",
    sort_order: 0,
    is_cover: false,
  };

  it("returns created image on success", async () => {
    const created = { id: "i1", alt_text: null, created_at: "2026-01-01", ...payload };
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: created, error: null }) as ReturnType<typeof sb.from>
    );

    const result = await service.addProductImage(payload);
    expect(result).toEqual(created);
  });

  // BDD HU-3.1 Scenario 3: invalid data is rejected with actionable error
  it("throws actionable message on check constraint violation (23514 — empty url/path or negative order)", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "check violation", code: "23514" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.addProductImage(payload)).rejects.toThrow(
      "Los datos de la imagen son inválidos"
    );
  });

  it("throws actionable message on duplicate sort_order per product (23505)", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "unique violation", code: "23505" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.addProductImage(payload)).rejects.toThrow(
      "Ya existe una imagen en esa posición para este producto."
    );
  });

  it("throws generic Error for unknown Supabase errors", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "unknown" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.addProductImage(payload)).rejects.toThrow("unknown");
  });
});

// BDD HU-3.1 Scenario 2: single cover enforced via two sequential updates
describe("setProductImageCover", () => {
  it("clears all covers for product then sets new cover", async () => {
    const sb = await getSupabase();
    // mockReturnValueOnce: first call (clear) returns success; subsequent (set) also success.
    // resolves.toBeUndefined() proves both sequential updates completed without error.
    vi.mocked(sb.from)
      .mockReturnValueOnce(makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>)
      .mockReturnValue(makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>);

    await expect(service.setProductImageCover("p1", "i2")).resolves.toBeUndefined();
  });

  it("throws if clearing covers fails", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValueOnce(
      makeChain({ data: null, error: { message: "RLS denied on clear" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.setProductImageCover("p1", "i2")).rejects.toThrow("RLS denied on clear");
  });

  it("throws if setting new cover fails", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from)
      .mockReturnValueOnce(makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>) // clear ok
      .mockReturnValue(
        makeChain({ data: null, error: { message: "RLS denied on set" } }) as ReturnType<typeof sb.from>
      );

    await expect(service.setProductImageCover("p1", "i2")).rejects.toThrow("RLS denied on set");
  });
});

describe("deleteProductImage", () => {
  const setupStorageMock = (removeMock: ReturnType<typeof vi.fn>) => async () => {
    const sb = await getSupabase();
    vi.mocked(sb.storage.from).mockReturnValue({ remove: removeMock } as unknown as StorageChain);
    return sb;
  };

  it("resolves and attempts storage cleanup on successful table delete", async () => {
    const removeMock = vi.fn(() => Promise.resolve({ data: [], error: null }));
    const sb = await setupStorageMock(removeMock)();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>
    );

    await expect(service.deleteProductImage("i1", "products/casco.jpg")).resolves.toBeUndefined();
    expect(removeMock).toHaveBeenCalledWith(["products/casco.jpg"]);
  });

  it("throws Error when table delete fails without touching storage", async () => {
    const removeMock = vi.fn();
    const sb = await setupStorageMock(removeMock)();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "RLS denied" } }) as ReturnType<typeof sb.from>
    );

    await expect(service.deleteProductImage("i1", "products/casco.jpg")).rejects.toThrow("RLS denied");
    expect(removeMock).not.toHaveBeenCalled();
  });
});

// ── HU-3.2 — uploadProductImage ───────────────────────────────────────────────

describe("uploadProductImage", () => {
  const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });

  const mockImage = {
    id: "i-new",
    product_id: "p1",
    storage_path: "products/p1/uuid.jpg",
    public_url: "https://cdn/products/p1/uuid.jpg",
    alt_text: null,
    sort_order: 0,
    is_cover: false,
    created_at: "2026-01-01",
  };

  beforeEach(() => vi.clearAllMocks());

  it("uploads file to storage then inserts product_images row", async () => {
    const uploadMock = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrlMock = vi.fn().mockReturnValue({
      data: { publicUrl: "https://cdn/products/p1/uuid.jpg" },
    });
    const sb = await getSupabase();
    vi.mocked(sb.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: "admin-1" } } },
      error: null,
    } as never);
    vi.mocked(sb.storage.from).mockReturnValue({
      upload: uploadMock,
      getPublicUrl: getPublicUrlMock,
      remove: vi.fn(),
    } as unknown as StorageUploadChain);
    vi.mocked(sb.from)
      // assertActiveAdminSession -> profiles select
      .mockReturnValueOnce(
        makeChain({
          data: { role: "admin", is_active: true },
          error: null,
        }) as ReturnType<typeof sb.from>
      )
      // addProductImage insert
      .mockReturnValue(
        makeChain({ data: mockImage, error: null }) as ReturnType<typeof sb.from>
      );

    const result = await service.uploadProductImage("p1", file, 0);

    expect(uploadMock).toHaveBeenCalledOnce();
    expect(result.product_id).toBe("p1");
    expect(result.is_cover).toBe(false);
  });

  it("throws when storage upload fails — does not attempt DB insert", async () => {
    const uploadMock = vi.fn().mockResolvedValue({ error: { message: "bucket not found" } });
    const sb = await getSupabase();
    vi.mocked(sb.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: "admin-1" } } },
      error: null,
    } as never);
    vi.mocked(sb.storage.from).mockReturnValue({
      upload: uploadMock,
      getPublicUrl: vi.fn(),
      remove: vi.fn(),
    } as unknown as StorageUploadChain);
    vi.mocked(sb.from).mockReturnValue(
      makeChain({
        data: { role: "admin", is_active: true },
        error: null,
      }) as ReturnType<typeof sb.from>
    );

    await expect(service.uploadProductImage("p1", file, 0)).rejects.toThrow(
      "bucket not found"
    );
    // only session/profile check should hit DB, insert should not.
    expect(sb.from).toHaveBeenCalledTimes(1);
  });

  it("throws actionable message when admin session is missing", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    await expect(service.uploadProductImage("p1", file, 0)).rejects.toThrow(
      "Tu sesión de administrador expiró"
    );
    expect(sb.from).not.toHaveBeenCalled();
  });

  it("cleans up storage object when DB insert fails after upload", async () => {
    const uploadMock = vi.fn().mockResolvedValue({ error: null });
    const removeMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const sb = await getSupabase();
    vi.mocked(sb.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: "admin-1" } } },
      error: null,
    } as never);
    vi.mocked(sb.storage.from).mockReturnValue({
      upload: uploadMock,
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: "https://cdn/products/p1/uuid.jpg" },
      }),
      remove: removeMock,
    } as unknown as StorageUploadChain);
    vi.mocked(sb.from)
      .mockReturnValueOnce(
        makeChain({
          data: { role: "admin", is_active: true },
          error: null,
        }) as ReturnType<typeof sb.from>
      )
      .mockReturnValue(
        makeChain({
          data: null,
          error: { message: "new row violates row-level security policy", code: "42501" },
        }) as ReturnType<typeof sb.from>
      );

    await expect(service.uploadProductImage("p1", file, 0)).rejects.toThrow(
      "No tienes permisos para subir imágenes"
    );
    expect(removeMock).toHaveBeenCalledOnce();
  });
});

// ── HU-3.2 — batchUpdateSortOrder ────────────────────────────────────────────

describe("batchUpdateSortOrder", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: null }) as ReturnType<typeof sb.from>
    );
  });

  it("resolves when both phases succeed (2 images)", async () => {
    await expect(
      service.batchUpdateSortOrder("p1", ["img-1", "img-2"])
    ).resolves.toBeUndefined();
  });

  it("calls supabase.from() twice per image across both phases", async () => {
    const sb = await getSupabase();
    await service.batchUpdateSortOrder("p1", ["img-1", "img-2"]);
    // 2 images × 2 phases = 4 calls (cleared before this test)
    expect(sb.from).toHaveBeenCalledTimes(4);
  });

  it("throws on phase 1 update failure", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({ data: null, error: { message: "phase1 rls error" } }) as ReturnType<typeof sb.from>
    );

    await expect(
      service.batchUpdateSortOrder("p1", ["img-1", "img-2"])
    ).rejects.toThrow("phase1 rls error");
  });

  it("resolves immediately when orderedIds is empty without calling supabase", async () => {
    const sb = await getSupabase();
    await service.batchUpdateSortOrder("p1", []);
    expect(sb.from).not.toHaveBeenCalled();
  });
});
