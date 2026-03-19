import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductManager from "@/components/admin/ProductManager";
import * as service from "@/lib/api/admin-catalog-service";
import type { Category } from "@/types/supabase";

vi.mock("@/lib/api/admin-catalog-service");
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "EPP",
    slug: "epp",
    sort_order: 1,
    is_active: true,
    created_at: "2026-03-18",
  },
  {
    id: "cat-2",
    name: "Altura",
    slug: "altura",
    sort_order: 2,
    is_active: true,
    created_at: "2026-03-18",
  },
];

describe("HU-5.3 admin multi-category assignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(service.listProducts).mockResolvedValue([]);
    vi.mocked(service.listCategories).mockResolvedValue(CATEGORIES);
    vi.mocked(service.createProduct).mockResolvedValue({
      id: "p-1",
      name: "Arnés Pro",
      slug: "arnes-pro",
      category_id: "cat-1",
      short_description: null,
      description: null,
      specs_json: {},
      is_active: true,
      created_at: "2026-03-18",
      updated_at: "2026-03-18",
    });
  });

  it("sends selected category_ids on product creation", async () => {
    render(<ProductManager />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /nuevo/i })).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: /nuevo/i }));
    await userEvent.type(screen.getByLabelText(/nombre \*/i), "Arnés Pro");
    await userEvent.click(screen.getByLabelText("EPP"));
    await userEvent.click(screen.getByLabelText("Altura"));
    await userEvent.click(screen.getByRole("button", { name: /crear producto/i }));

    await waitFor(() => expect(service.createProduct).toHaveBeenCalledOnce());
    expect(service.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Arnés Pro",
        slug: "arnes-pro",
        category_ids: ["cat-1", "cat-2"],
      }),
    );
  });
});
