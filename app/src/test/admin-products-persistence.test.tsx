/**
 * HU-2.3 — Scenario 2: ProductManager real persistence behaviors
 * Tests: loading, error, render, search/filter, create dialog, toggle.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProductManager from "@/components/admin/ProductManager";
import * as service from "@/lib/api/admin-catalog-service";
import type { Category } from "@/types/supabase";
import type { ProductWithCategory } from "@/lib/api/admin-catalog-service";

vi.mock("@/lib/api/admin-catalog-service");
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "EPP", slug: "epp", sort_order: 1, is_active: true, created_at: "2024-01-01" },
];

const MOCK_PRODUCTS: ProductWithCategory[] = [
  {
    id: "p-1",
    category_id: "cat-1",
    category_name: "EPP",
    name: "Casco MSA",
    slug: "casco-msa",
    short_description: "Casco de seguridad certificado",
    description: null,
    specs_json: {},
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "p-2",
    category_id: "cat-1",
    category_name: "EPP",
    name: "Guante de látex",
    slug: "guante-latex",
    short_description: null,
    description: null,
    specs_json: {},
    is_active: false,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

describe("ProductManager — persistence (HU-2.3)", () => {
  beforeEach(() => {
    vi.mocked(service.listProducts).mockResolvedValue(MOCK_PRODUCTS);
    vi.mocked(service.listCategories).mockResolvedValue(MOCK_CATEGORIES);
    vi.mocked(service.createProduct).mockResolvedValue({
      id: "p-3",
      category_id: "cat-1",
      name: "Nuevo producto",
      slug: "nuevo-producto",
      short_description: null,
      description: null,
      specs_json: {},
      is_active: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    });
    vi.mocked(service.updateProduct).mockResolvedValue({
      ...MOCK_PRODUCTS[0],
      name: "Casco MSA Actualizado",
    });
    vi.mocked(service.toggleProductActive).mockResolvedValue(undefined);
  });

  it("shows loading spinner before data arrives", () => {
    vi.mocked(service.listProducts).mockReturnValue(new Promise(() => {}));
    vi.mocked(service.listCategories).mockReturnValue(new Promise(() => {}));
    render(<ProductManager />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders products from Supabase after load", async () => {
    render(<ProductManager />);
    await waitFor(() => expect(screen.getByText("Casco MSA")).toBeInTheDocument());
    expect(screen.getByText("Guante de látex")).toBeInTheDocument();
  });

  it("shows active/inactive badges", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });

  it("shows error with retry button on service failure", async () => {
    vi.mocked(service.listProducts).mockRejectedValue(new Error("Error de red"));
    render(<ProductManager />);
    await waitFor(() => expect(screen.getByText(/Error de red/)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  it("filters products by search term (client-side)", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));
    await userEvent.type(screen.getByPlaceholderText(/buscar productos/i), "casco");
    expect(screen.getByText("Casco MSA")).toBeInTheDocument();
    expect(screen.queryByText("Guante de látex")).not.toBeInTheDocument();
  });

  it("shows empty state when no products match filter", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));
    await userEvent.type(screen.getByPlaceholderText(/buscar productos/i), "xyznotexist");
    expect(screen.getByText(/no hay productos con los filtros/i)).toBeInTheDocument();
  });

  it("opens create dialog with empty form on Nuevo click", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));
    await userEvent.click(screen.getByRole("button", { name: /nuevo/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Nuevo producto")).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre \*/i)).toHaveValue("");
  });

  it("auto-generates slug from name in create dialog", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));
    await userEvent.click(screen.getByRole("button", { name: /nuevo/i }));
    await userEvent.type(screen.getByLabelText(/nombre \*/i), "Botas de Hule");
    await waitFor(() =>
      expect(screen.getByLabelText(/slug \*/i)).toHaveValue("botas-de-hule")
    );
  });

  it("shows toast error if name/slug/category missing on submit", async () => {
    const { toast } = await import("sonner");
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));
    await userEvent.click(screen.getByRole("button", { name: /nuevo/i }));
    await userEvent.click(screen.getByRole("button", { name: /crear producto/i }));
    expect(toast.error).toHaveBeenCalledWith(
      "Nombre, slug y categoría son obligatorios."
    );
  });

  it("calls createProduct and closes dialog on valid submit", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));
    await userEvent.click(screen.getByRole("button", { name: /nuevo/i }));
    await userEvent.type(screen.getByLabelText(/nombre \*/i), "Nuevo producto");
    // Select category from dialog combobox
    const categorySelect = screen.getByRole("combobox", { name: /categoría/i });
    await userEvent.click(categorySelect);
    await userEvent.click(screen.getByRole("option", { name: "EPP" }));
    await userEvent.click(screen.getByRole("button", { name: /crear producto/i }));
    await waitFor(() => expect(service.createProduct).toHaveBeenCalledOnce());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls toggleProductActive with correct arguments", async () => {
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));
    await userEvent.click(screen.getByRole("button", { name: /desactivar casco msa/i }));
    await waitFor(() =>
      expect(service.toggleProductActive).toHaveBeenCalledWith("p-1", false)
    );
  });

  it("reverts optimistic toggle when service throws", async () => {
    const { toast } = await import("sonner");
    vi.mocked(service.toggleProductActive).mockRejectedValue(new Error("RLS denied"));
    render(<ProductManager />);
    await waitFor(() => screen.getByText("Casco MSA"));
    await userEvent.click(screen.getByRole("button", { name: /desactivar casco msa/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });
});
