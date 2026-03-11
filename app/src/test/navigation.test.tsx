import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";
import NotFound from "@/pages/NotFound";

describe("HU-1.1 navigation", () => {
  it("highlights current route without marking home as active on nested routes", () => {
    render(
      <MemoryRouter initialEntries={["/catalogo"]}>
        <Header />
      </MemoryRouter>,
    );

    const activeCatalogLinks = screen
      .getAllByRole("link", { name: "Catálogo" })
      .filter((link) => link.getAttribute("aria-current") === "page");
    const activeHomeLinks = screen
      .getAllByRole("link", { name: "Inicio" })
      .filter((link) => link.getAttribute("aria-current") === "page");

    expect(activeCatalogLinks.length).toBeGreaterThan(0);
    expect(activeHomeLinks).toHaveLength(0);
  });

  it("opens and closes mobile menu when selecting a navigation link", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.click(within(dialog).getByRole("link", { name: "Contacto" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("NotFound page", () => {
  it("shows return CTAs to Home and Catalog", () => {
    render(
      <MemoryRouter initialEntries={["/ruta-inexistente"]}>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Ir a Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Ver Catalogo" })).toHaveAttribute("href", "/catalogo");
  });
});
