/**
 * HU-2.3 — Scenario 1: CategoryManager real persistence behaviors
 * Tests: loading, error, render, create dialog, optimistic toggle.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CategoryManager from "@/components/admin/CategoryManager";
import * as service from "@/lib/api/admin-catalog-service";
import type { Category } from "@/types/supabase";

vi.mock("@/lib/api/admin-catalog-service");
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "EPP", slug: "epp", sort_order: 1, is_active: true, created_at: "2024-01-01" },
  { id: "cat-2", name: "Calzado", slug: "calzado", sort_order: 2, is_active: false, created_at: "2024-01-01" },
];

describe("CategoryManager — persistence (HU-2.3)", () => {
  beforeEach(() => {
    vi.mocked(service.listCategories).mockResolvedValue(MOCK_CATEGORIES);
    vi.mocked(service.createCategory).mockResolvedValue({
      id: "cat-3",
      name: "Guantes",
      slug: "guantes",
      sort_order: 0,
      is_active: true,
      created_at: "2024-01-01",
    });
    vi.mocked(service.updateCategory).mockResolvedValue({
      ...MOCK_CATEGORIES[0],
      name: "EPP Actualizado",
    });
    vi.mocked(service.toggleCategoryActive).mockResolvedValue(undefined);
  });

  it("shows loading spinner before data arrives", () => {
    vi.mocked(service.listCategories).mockReturnValue(new Promise(() => {}));
    render(<CategoryManager />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders categories from Supabase after load", async () => {
    render(<CategoryManager />);
    await waitFor(() => expect(screen.getByText("EPP")).toBeInTheDocument());
    expect(screen.getByText("Calzado")).toBeInTheDocument();
  });

  it("shows active/inactive badges correctly", async () => {
    render(<CategoryManager />);
    await waitFor(() => screen.getByText("EPP"));
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.getByText("Inactiva")).toBeInTheDocument();
  });

  it("shows error message and retry button on service failure", async () => {
    vi.mocked(service.listCategories).mockRejectedValue(new Error("Conexión fallida"));
    render(<CategoryManager />);
    await waitFor(() => expect(screen.getByText(/Conexión fallida/)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  it("opens create dialog with empty form on Nueva click", async () => {
    render(<CategoryManager />);
    await waitFor(() => screen.getByText("EPP"));
    await userEvent.click(screen.getByRole("button", { name: /nueva/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Nueva categoría")).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre \*/i)).toHaveValue("");
  });

  it("auto-generates slug from name in create dialog", async () => {
    render(<CategoryManager />);
    await waitFor(() => screen.getByText("EPP"));
    await userEvent.click(screen.getByRole("button", { name: /nueva/i }));
    await userEvent.type(screen.getByLabelText(/nombre \*/i), "Protección Auditiva");
    await waitFor(() =>
      expect(screen.getByLabelText(/slug \*/i)).toHaveValue("proteccion-auditiva")
    );
  });

  it("calls createCategory and closes dialog on valid submit", async () => {
    render(<CategoryManager />);
    await waitFor(() => screen.getByText("EPP"));
    await userEvent.click(screen.getByRole("button", { name: /nueva/i }));
    await userEvent.type(screen.getByLabelText(/nombre \*/i), "Guantes");
    await userEvent.click(screen.getByRole("button", { name: /crear categoría/i }));
    await waitFor(() => expect(service.createCategory).toHaveBeenCalledOnce());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows error toast on duplicate slug (createCategory rejects)", async () => {
    const { toast } = await import("sonner");
    vi.mocked(service.createCategory).mockRejectedValue(
      new Error("Ya existe una categoría con ese nombre o slug.")
    );
    render(<CategoryManager />);
    await waitFor(() => screen.getByText("EPP"));
    await userEvent.click(screen.getByRole("button", { name: /nueva/i }));
    await userEvent.type(screen.getByLabelText(/nombre \*/i), "EPP");
    await userEvent.click(screen.getByRole("button", { name: /crear categoría/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Ya existe una categoría con ese nombre o slug."
      )
    );
  });

  it("opens edit dialog prefilled with category data", async () => {
    render(<CategoryManager />);
    await waitFor(() => screen.getByText("EPP"));
    await userEvent.click(screen.getByRole("button", { name: /editar epp/i }));
    expect(screen.getByLabelText(/nombre \*/i)).toHaveValue("EPP");
    expect(screen.getByLabelText(/slug \*/i)).toHaveValue("epp");
  });

  it("calls toggleCategoryActive with correct id and next value", async () => {
    render(<CategoryManager />);
    await waitFor(() => screen.getByText("EPP"));
    await userEvent.click(screen.getByRole("button", { name: /desactivar epp/i }));
    await waitFor(() =>
      expect(service.toggleCategoryActive).toHaveBeenCalledWith("cat-1", false)
    );
  });

  it("reverts optimistic toggle when service throws", async () => {
    const { toast } = await import("sonner");
    vi.mocked(service.toggleCategoryActive).mockRejectedValue(new Error("RLS denied"));
    render(<CategoryManager />);
    await waitFor(() => screen.getByText("EPP"));
    await userEvent.click(screen.getByRole("button", { name: /desactivar epp/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    // Badge should revert to "Activa"
    expect(screen.getByText("Activa")).toBeInTheDocument();
  });
});
