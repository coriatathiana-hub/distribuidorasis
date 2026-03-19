import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import ProductCard from "@/components/ProductCard";
import type { PublicProduct } from "@/lib/api/public-catalog-service";

function makeProduct(overrides: Partial<PublicProduct>): PublicProduct {
  return {
    id: "prod-1",
    slug: "arnes-3-aros",
    name: "Arnés de Seguridad 3 Aros",
    category_id: "cat-epp",
    category_name: "EPP",
    category_ids: ["cat-epp"],
    category_names: ["EPP"],
    short_description: "Arnés para trabajo en alturas.",
    description: "Descripción larga",
    specs_json: {},
    cover_image_url: "https://cdn/cover.jpg",
    images: [],
    ...overrides,
  };
}

describe("ProductCard carousel (HU-3.3)", () => {
  it("prioriza imagen de portada como imagen principal en listado", () => {
    const product = makeProduct({
      images: [
        {
          id: "img-2",
          public_url: "https://cdn/second.jpg",
          alt_text: "Vista lateral",
          sort_order: 1,
          is_cover: false,
        },
        {
          id: "img-1",
          public_url: "https://cdn/cover.jpg",
          alt_text: "Portada",
          sort_order: 2,
          is_cover: true,
        },
      ],
    });

    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );

    const cover = screen.getByAltText("Arnés de Seguridad 3 Aros");
    expect(cover).toBeInTheDocument();
    expect(cover).toHaveAttribute("src", "https://cdn/cover.jpg");
  });

  it("mantiene fallback visual estable cuando falla la carga de imagen", () => {
    const product = makeProduct({
      images: [
        {
          id: "img-1",
          public_url: "https://cdn/broken.jpg",
          alt_text: "Portada rota",
          sort_order: 0,
          is_cover: true,
        },
      ],
      cover_image_url: "https://cdn/broken.jpg",
    });

    const { container } = render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );

    const img = screen.getByAltText("Arnés de Seguridad 3 Aros");
    fireEvent.error(img);

    // lucide icon renders with this class when fallback is active
    expect(container.querySelector(".lucide-package")).toBeInTheDocument();
  });
});

