import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Catalogo from "@/pages/Catalogo";

describe("HU-1.2 catalog filters", () => {
  const hasResultCount = (count: number) => (_: string, node: Element | null) =>
    node?.tagName === "P" && (node.textContent?.includes(`${count} producto`) ?? false);

  it("filters by search text and restores full list with clear filters", async () => {
    render(
      <MemoryRouter>
        <Catalogo />
      </MemoryRouter>,
    );

    expect(screen.getByText(hasResultCount(46))).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Buscar producto"), {
      target: { value: "arnés" },
    });

    await waitFor(() => {
      expect(screen.getByText(hasResultCount(2))).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    await waitFor(() => {
      expect(screen.getByText(hasResultCount(46))).toBeInTheDocument();
    });
  });

  it("filters by category and updates result count", async () => {
    render(
      <MemoryRouter>
        <Catalogo />
      </MemoryRouter>,
    );

    const categorySelect = screen.getByRole("combobox", { name: "Categoría" });
    fireEvent.keyDown(categorySelect, { key: "ArrowDown" });
    const option = await screen.findByRole("option", {
      name: "Señalización y Delimitación",
    });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText(hasResultCount(4))).toBeInTheDocument();
    });
  });

  it("shows empty state and allows clearing filters from empty result", async () => {
    render(
      <MemoryRouter>
        <Catalogo />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Buscar producto"), {
      target: { value: "producto-inexistente" },
    });

    await waitFor(() => {
      expect(screen.getByText("No se encontraron productos")).toBeInTheDocument();
    });

    const clearButtons = within(screen.getByText("No se encontraron productos").parentElement!)
      .getAllByRole("button", { name: "Limpiar filtros" });
    fireEvent.click(clearButtons[clearButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText(hasResultCount(46))).toBeInTheDocument();
    });
  });
});
