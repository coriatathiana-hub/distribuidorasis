/**
 * HU-1.2 + HU-2.3 Scenario 3 — Catalog filters with real Supabase service
 * Service is mocked; tests verify client-side filter behavior (search + category).
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Catalogo from "@/pages/Catalogo";
import * as service from "@/lib/api/public-catalog-service";
import type { PublicCategory, PublicProduct } from "@/lib/api/public-catalog-service";

vi.mock("@/lib/api/public-catalog-service");

const MOCK_CATEGORIES: PublicCategory[] = [
  { id: "cat-epp", name: "EPP", slug: "epp", sort_order: 1 },
  { id: "cat-calzado", name: "Calzado", slug: "calzado", sort_order: 2 },
  { id: "cat-senal", name: "Señalización y Delimitación", slug: "senalizacion", sort_order: 3 },
];

const base = (overrides: Partial<PublicProduct>): PublicProduct => ({
  id: "id",
  slug: "slug",
  name: "Producto",
  category_id: "cat-epp",
  category_name: "EPP",
  category_ids: ["cat-epp"],
  category_names: ["EPP"],
  short_description: null,
  description: null,
  specs_json: {},
  cover_image_url: null,
  images: [],
  ...overrides,
});

const MOCK_PRODUCTS: PublicProduct[] = [
  base({ id: "p1", slug: "arnes-3-aros", name: "Arnés de Seguridad 3 Aros", category_id: "cat-epp", category_name: "EPP", category_ids: ["cat-epp"], category_names: ["EPP"] }),
  base({ id: "p2", slug: "arnes-vform", name: "Arnés V-Form MSA", category_id: "cat-epp", category_name: "EPP", category_ids: ["cat-epp"], category_names: ["EPP"] }),
  base({ id: "p3", slug: "bota-casquillo", name: "Bota con Casquillo", category_id: "cat-calzado", category_name: "Calzado", category_ids: ["cat-calzado"], category_names: ["Calzado"] }),
  base({ id: "p4", slug: "cinta-peligro", name: "Cinta de Peligro", category_id: "cat-senal", category_name: "Señalización y Delimitación", category_ids: ["cat-senal"], category_names: ["Señalización y Delimitación"] }),
  base({ id: "p5", slug: "malla-naranja", name: "Malla Naranja", category_id: "cat-senal", category_name: "Señalización y Delimitación", category_ids: ["cat-senal"], category_names: ["Señalización y Delimitación"] }),
];

function renderCatalogo() {
  return render(
    <MemoryRouter>
      <Catalogo />
    </MemoryRouter>,
  );
}

describe("HU-1.2 catalog filters", () => {
  beforeEach(() => {
    vi.mocked(service.listActiveCategories).mockResolvedValue(MOCK_CATEGORIES);
    vi.mocked(service.listActiveProducts).mockResolvedValue(MOCK_PRODUCTS);
  });

  const hasResultCount = (count: number) => (_: string, node: Element | null) =>
    node?.tagName === "P" && (node.textContent?.includes(`${count} producto`) ?? false);

  it("filters by search text and restores full list with clear filters", async () => {
    renderCatalogo();

    await waitFor(() => expect(screen.getByText(hasResultCount(5))).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Buscar producto"), {
      target: { value: "arnés" },
    });

    await waitFor(() => {
      expect(screen.getByText(hasResultCount(2))).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    await waitFor(() => {
      expect(screen.getByText(hasResultCount(5))).toBeInTheDocument();
    });
  });

  it("filters by category and updates result count", async () => {
    renderCatalogo();

    await waitFor(() => expect(screen.getByText(hasResultCount(5))).toBeInTheDocument());

    const categorySelect = screen.getByRole("combobox", { name: "Categoría" });
    fireEvent.keyDown(categorySelect, { key: "ArrowDown" });
    const option = await screen.findByRole("option", {
      name: "Señalización y Delimitación",
    });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText(hasResultCount(2))).toBeInTheDocument();
    });
  });

  it("shows empty state and allows clearing filters from empty result", async () => {
    renderCatalogo();

    await waitFor(() => expect(screen.getByText(hasResultCount(5))).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Buscar producto"), {
      target: { value: "producto-inexistente" },
    });

    await waitFor(() => {
      expect(screen.getByText("No se encontraron productos")).toBeInTheDocument();
    });

    // Two "Limpiar filtros" buttons exist (sidebar + empty state); click either
    const clearButtons = screen.getAllByRole("button", { name: "Limpiar filtros" });
    fireEvent.click(clearButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(hasResultCount(5))).toBeInTheDocument();
    });
  });

  it("shows error state when service fails", async () => {
    vi.mocked(service.listActiveProducts).mockRejectedValue(new Error("Sin conexión"));
    renderCatalogo();

    await waitFor(() =>
      expect(screen.getByText(/Sin conexión/)).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
