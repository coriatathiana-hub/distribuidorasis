import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Catalogo from "@/pages/Catalogo";
import * as service from "@/lib/api/public-catalog-service";
import type { PublicCategory, PublicProduct } from "@/lib/api/public-catalog-service";

vi.mock("@/lib/api/public-catalog-service");

const CATEGORIES: PublicCategory[] = [
  { id: "cat-epp", name: "EPP", slug: "epp", sort_order: 1 },
  { id: "cat-altura", name: "Altura", slug: "altura", sort_order: 2 },
];

const PRODUCTS: PublicProduct[] = [
  {
    id: "p-multi",
    slug: "arnes-pro",
    name: "Arnés Pro",
    category_id: "cat-epp",
    category_name: "EPP",
    category_ids: ["cat-epp", "cat-altura"],
    category_names: ["EPP", "Altura"],
    short_description: "Producto multi-categoría",
    description: null,
    specs_json: {},
    cover_image_url: null,
    images: [],
  },
  {
    id: "p-single",
    slug: "casco",
    name: "Casco",
    category_id: "cat-epp",
    category_name: "EPP",
    category_ids: ["cat-epp"],
    category_names: ["EPP"],
    short_description: null,
    description: null,
    specs_json: {},
    cover_image_url: null,
    images: [],
  },
];

function renderCatalogo() {
  return render(
    <MemoryRouter>
      <Catalogo />
    </MemoryRouter>,
  );
}

describe("HU-5.3 public filter with multi-category products", () => {
  beforeEach(() => {
    vi.mocked(service.listActiveCategories).mockResolvedValue(CATEGORIES);
    vi.mocked(service.listActiveProducts).mockResolvedValue(PRODUCTS);
  });

  it("keeps a product visible when filtering by any assigned category", async () => {
    renderCatalogo();
    await waitFor(() => expect(screen.getByText("Arnés Pro")).toBeInTheDocument());

    const categorySelect = screen.getByRole("combobox", { name: "Categoría" });
    fireEvent.keyDown(categorySelect, { key: "ArrowDown" });
    const option = await screen.findByRole("option", { name: "Altura" });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText("Arnés Pro")).toBeInTheDocument();
      expect(screen.queryByText("Casco")).not.toBeInTheDocument();
    });
  });
});
