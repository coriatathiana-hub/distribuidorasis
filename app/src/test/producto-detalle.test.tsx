/**
 * HU-1.3 + HU-2.3 Scenario 3 — Product detail with real Supabase service
 * Service is mocked; tests verify product rendering, navigation, and not-found state.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import Producto from "@/pages/Producto";
import * as service from "@/lib/api/public-catalog-service";
import type { PublicProduct } from "@/lib/api/public-catalog-service";

vi.mock("@/lib/api/public-catalog-service");

const MOCK_PRODUCT: PublicProduct = {
  id: "uuid-arnes",
  slug: "arnes-3-aros",
  name: "Arnés de Seguridad 3 Aros",
  category_id: "cat-epp",
  category_name: "EPP",
  category_ids: ["cat-epp"],
  category_names: ["EPP"],
  short_description: "Arnés tipo completo para trabajos en altura",
  description: "Descripción detallada del arnés con certificaciones NOM.",
  specs_json: {},
  cover_image_url: "https://cdn/arnes-cover.jpg",
  images: [
    {
      id: "img-cover",
      public_url: "https://cdn/arnes-cover.jpg",
      alt_text: "Arnés - portada",
      sort_order: 0,
      is_cover: true,
    },
    {
      id: "img-side",
      public_url: "https://cdn/arnes-side.jpg",
      alt_text: "Arnés - vista lateral",
      sort_order: 1,
      is_cover: false,
    },
  ],
};

function renderProducto(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/producto/${slug}`]}>
      <Routes>
        <Route path="/producto/:id" element={<Producto />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("HU-1.3 detalle de producto", () => {
  beforeEach(() => {
    vi.mocked(service.getProductBySlug).mockImplementation(async (slug) =>
      slug === "arnes-3-aros" ? MOCK_PRODUCT : null
    );
  });

  it("muestra datos clave y CTA de contacto con contexto del producto", async () => {
    renderProducto("arnes-3-aros");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Arnés de Seguridad 3 Aros" })
      ).toBeInTheDocument()
    );

    expect(screen.getByText("EPP")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Imagen anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Imagen siguiente" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contactar" })).toHaveAttribute(
      "href",
      "/contacto?origen=detalle&productoId=arnes-3-aros&producto=Arn%C3%A9s%20de%20Seguridad%203%20Aros",
    );
  });

  it("expone navegacion contextual por breadcrumb y boton de retorno", async () => {
    renderProducto("arnes-3-aros");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Arnés de Seguridad 3 Aros" })
      ).toBeInTheDocument()
    );

    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getAllByRole("link", { name: "Catálogo" })[0]).toHaveAttribute(
      "href",
      "/catalogo",
    );
    expect(screen.getByRole("link", { name: "Volver al catálogo" })).toHaveAttribute(
      "href",
      "/catalogo",
    );
  });

  it("muestra estado no encontrado para producto inexistente", async () => {
    renderProducto("slug-que-no-existe");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Producto no encontrado" })
      ).toBeInTheDocument()
    );

    expect(screen.getByRole("link", { name: "Volver al catálogo" })).toHaveAttribute(
      "href",
      "/catalogo",
    );
  });
});
