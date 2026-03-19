/**
 * HU-5.2 — Deferred deletion behavior while editing products
 *
 * Verifies that image deletion is only physically executed after clicking
 * "Guardar cambios" in the product edit dialog.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductManager from "@/components/admin/ProductManager";
import * as service from "@/lib/api/admin-catalog-service";
import type { Category, ProductImage } from "@/types/supabase";
import type { ProductWithCategory } from "@/lib/api/admin-catalog-service";

vi.mock("@/lib/api/admin-catalog-service");
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const CATEGORIES: Category[] = [
  { id: "cat-1", name: "EPP", slug: "epp", sort_order: 1, is_active: true, created_at: "2024-01-01" },
];

const PRODUCTS: ProductWithCategory[] = [
  {
    id: "p-1",
    category_id: "cat-1",
    category_name: "EPP",
    category_ids: ["cat-1"],
    category_names: ["EPP"],
    name: "Casco MSA",
    slug: "casco-msa",
    short_description: "Casco de seguridad",
    description: "Detalle",
    specs_json: {},
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const IMAGES: ProductImage[] = [
  {
    id: "img-1",
    product_id: "p-1",
    storage_path: "products/p-1/a.jpg",
    public_url: "https://cdn/a.jpg",
    alt_text: null,
    sort_order: 0,
    is_cover: true,
    created_at: "2026-01-01",
  },
  {
    id: "img-2",
    product_id: "p-1",
    storage_path: "products/p-1/b.jpg",
    public_url: "https://cdn/b.jpg",
    alt_text: null,
    sort_order: 1,
    is_cover: false,
    created_at: "2026-01-01",
  },
];

describe("HU-5.2: Product edit defers physical image deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(service.listProducts).mockResolvedValue(PRODUCTS);
    vi.mocked(service.listCategories).mockResolvedValue(CATEGORIES);
    vi.mocked(service.updateProduct).mockResolvedValue({
      ...PRODUCTS[0],
      updated_at: "2026-03-19",
    });
    vi.mocked(service.listProductImages).mockResolvedValue(IMAGES);
    vi.mocked(service.deleteProductImage).mockResolvedValue(undefined);
    vi.mocked(service.batchUpdateSortOrder).mockResolvedValue(undefined);
    vi.mocked(service.setProductImageCover).mockResolvedValue(undefined);
    vi.mocked(service.uploadProductImage).mockRejectedValue(new Error("Not used"));
  });

  it("does not call deleteProductImage before clicking Guardar cambios", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));

    await userEvent.click(screen.getByRole("button", { name: /editar casco msa/i }));
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));

    await userEvent.click(screen.getByRole("button", { name: /eliminar imagen 1/i }));
    await waitFor(() =>
      expect(screen.getByText(/pendientes por eliminar: 1/i)).toBeInTheDocument(),
    );

    expect(service.deleteProductImage).not.toHaveBeenCalled();
  });

  it("keeps image persisted when cancelling edit dialog after pending delete", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));

    await userEvent.click(screen.getByRole("button", { name: /editar casco msa/i }));
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));
    await userEvent.click(screen.getByRole("button", { name: /eliminar imagen 1/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(service.deleteProductImage).not.toHaveBeenCalled();
  });

  it("executes physical delete only after Guardar cambios", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));

    await userEvent.click(screen.getByRole("button", { name: /editar casco msa/i }));
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));
    await userEvent.click(screen.getByRole("button", { name: /eliminar imagen 1/i }));
    await userEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(service.updateProduct).toHaveBeenCalledOnce();
      expect(service.deleteProductImage).toHaveBeenCalledWith("img-1", "products/p-1/a.jpg");
      expect(service.batchUpdateSortOrder).toHaveBeenCalledWith("p-1", ["img-2"]);
    });
  });
});
