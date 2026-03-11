import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Producto from "@/pages/Producto";

describe("HU-1.3 detalle de producto", () => {
  it("muestra datos clave y CTA de contacto con contexto del producto", () => {
    render(
      <MemoryRouter initialEntries={["/producto/1"]}>
        <Routes>
          <Route path="/producto/:id" element={<Producto />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Arnés de Seguridad 3 Aros" }),
    ).toBeInTheDocument();
    expect(screen.getByText("EPP")).toBeInTheDocument();
    expect(screen.getByText("Seguridad en Alturas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contactar" })).toHaveAttribute(
      "href",
      "/contacto?origen=detalle&productoId=1&producto=Arn%C3%A9s%20de%20Seguridad%203%20Aros",
    );
  });

  it("expone navegacion contextual por breadcrumb y boton de retorno", () => {
    render(
      <MemoryRouter initialEntries={["/producto/1"]}>
        <Routes>
          <Route path="/producto/:id" element={<Producto />} />
        </Routes>
      </MemoryRouter>,
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

  it("muestra estado no encontrado para producto inexistente", () => {
    render(
      <MemoryRouter initialEntries={["/producto/99999"]}>
        <Routes>
          <Route path="/producto/:id" element={<Producto />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Producto no encontrado" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al catálogo" })).toHaveAttribute(
      "href",
      "/catalogo",
    );
  });
});
