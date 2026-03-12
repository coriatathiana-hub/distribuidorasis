/**
 * HU-3.2 — Component tests for ImageGalleryManager
 *
 * BDD coverage:
 *   Scenario 1 — Carga con feedback por archivo (upload, validación, progreso)
 *   Scenario 2 — Reordenamiento y portada (mover, guardar orden, marcar portada)
 *   Scenario 3 — Validación de formato y tamaño (bloqueo selectivo, continúa con válidos)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ImageGalleryManager from "@/components/admin/ImageGalleryManager";
import * as service from "@/lib/api/admin-catalog-service";
import type { ProductImage } from "@/types/supabase";

vi.mock("@/lib/api/admin-catalog-service");
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_IMAGES: ProductImage[] = [
  {
    id: "img-1",
    product_id: "prod-1",
    storage_path: "products/prod-1/a.jpg",
    public_url: "https://cdn/a.jpg",
    alt_text: null,
    sort_order: 0,
    is_cover: true,
    created_at: "2026-01-01",
  },
  {
    id: "img-2",
    product_id: "prod-1",
    storage_path: "products/prod-1/b.jpg",
    public_url: "https://cdn/b.jpg",
    alt_text: null,
    sort_order: 1,
    is_cover: false,
    created_at: "2026-01-01",
  },
];

const NEW_IMAGE: ProductImage = {
  id: "img-new",
  product_id: "prod-1",
  storage_path: "products/prod-1/new.jpg",
  public_url: "https://cdn/new.jpg",
  alt_text: null,
  sort_order: 2,
  is_cover: false,
  created_at: "2026-01-01",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFileInput() {
  return document.querySelector('[data-testid="file-input"]') as HTMLInputElement;
}

// ── Setup ─────────────────────────────────────────────────────────────────────

describe("ImageGalleryManager (HU-3.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(service.listProductImages).mockResolvedValue(MOCK_IMAGES);
    vi.mocked(service.uploadProductImage).mockResolvedValue(NEW_IMAGE);
    vi.mocked(service.deleteProductImage).mockResolvedValue(undefined);
    vi.mocked(service.setProductImageCover).mockResolvedValue(undefined);
    vi.mocked(service.batchUpdateSortOrder).mockResolvedValue(undefined);
  });

  // ── Initial render ─────────────────────────────────────────────────────────

  it("muestra spinner mientras carga", () => {
    vi.mocked(service.listProductImages).mockReturnValue(new Promise(() => {}));
    render(<ImageGalleryManager productId="prod-1" />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renderiza galería con imágenes tras carga", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));
  });

  it("muestra badge 'Portada' en la imagen con is_cover=true", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));
    expect(screen.getByText("Portada")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay imágenes", async () => {
    vi.mocked(service.listProductImages).mockResolvedValue([]);
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() =>
      expect(screen.getByText(/no hay imágenes/i)).toBeInTheDocument(),
    );
  });

  // ── BDD Scenario 3: file validation ───────────────────────────────────────

  it("bloquea archivo de tipo no permitido con mensaje claro", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    const badFile = new File(["x"], "doc.pdf", { type: "application/pdf" });
    await userEvent.upload(getFileInput(), badFile, { applyAccept: false });
    expect(await screen.findByText(/tipo no permitido/i)).toBeInTheDocument();
    expect(service.uploadProductImage).not.toHaveBeenCalled();
  });

  it("bloquea archivo que supera el límite de tamaño con mensaje claro", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    const bigFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    await userEvent.upload(getFileInput(), bigFile);

    await waitFor(() =>
      expect(screen.getByText(/demasiado grande/i)).toBeInTheDocument(),
    );
    expect(service.uploadProductImage).not.toHaveBeenCalled();
  });

  it("procesa archivos válidos y bloquea los inválidos en la misma selección", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    const validFile = new File(["ok"], "photo.jpg", { type: "image/jpeg" });
    const invalidFile = new File(["bad"], "doc.pdf", { type: "application/pdf" });
    await userEvent.upload(getFileInput(), [validFile, invalidFile], {
      applyAccept: false,
    });

    await waitFor(() =>
      expect(service.uploadProductImage).toHaveBeenCalledOnce(),
    );
    expect(await screen.findByText(/tipo no permitido/i)).toBeInTheDocument();
  });

  // ── BDD Scenario 1: upload with feedback ──────────────────────────────────

  it("llama uploadProductImage con productId, archivo y sort_order correcto", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    await userEvent.upload(getFileInput(), file);

    await waitFor(() =>
      expect(service.uploadProductImage).toHaveBeenCalledWith("prod-1", file, 2),
    );
  });

  it("muestra error de servicio cuando uploadProductImage falla", async () => {
    const { toast } = await import("sonner");
    vi.mocked(service.uploadProductImage).mockRejectedValue(
      new Error("Storage unavailable"),
    );
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    const file = new File(["x"], "img.jpg", { type: "image/jpeg" });
    await userEvent.upload(getFileInput(), file);

    await waitFor(() =>
      expect(screen.getByText(/storage unavailable/i)).toBeInTheDocument(),
    );
    expect(toast.error).not.toHaveBeenCalled(); // service error shown inline
  });

  // ── BDD Scenario 2: reorder ────────────────────────────────────────────────

  it("muestra botón 'Guardar orden' al mover una imagen", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    await userEvent.click(screen.getByRole("button", { name: /mover imagen 2 arriba/i }));
    expect(screen.getByRole("button", { name: /guardar orden/i })).toBeInTheDocument();
  });

  it("llama batchUpdateSortOrder con IDs en nuevo orden al guardar", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    await userEvent.click(screen.getByRole("button", { name: /mover imagen 2 arriba/i }));
    await userEvent.click(screen.getByRole("button", { name: /guardar orden/i }));

    await waitFor(() =>
      expect(service.batchUpdateSortOrder).toHaveBeenCalledWith("prod-1", [
        "img-2",
        "img-1",
      ]),
    );
  });

  it("deshabilita botón arriba para la primera imagen", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    expect(
      screen.getByRole("button", { name: /mover imagen 1 arriba/i }),
    ).toBeDisabled();
  });

  it("deshabilita botón abajo para la última imagen", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    expect(
      screen.getByRole("button", { name: /mover imagen 2 abajo/i }),
    ).toBeDisabled();
  });

  // ── BDD Scenario 2: cover ─────────────────────────────────────────────────

  it("llama setProductImageCover al marcar portada", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    await userEvent.click(
      screen.getByRole("button", { name: /marcar imagen 2 como portada/i }),
    );

    await waitFor(() =>
      expect(service.setProductImageCover).toHaveBeenCalledWith("prod-1", "img-2"),
    );
  });

  it("no muestra botón de portada en la imagen que ya es portada", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    // img-1 is already the cover — no "marcar portada" button for position 1
    expect(
      screen.queryByRole("button", { name: /marcar imagen 1 como portada/i }),
    ).not.toBeInTheDocument();
  });

  // ── Delete ────────────────────────────────────────────────────────────────

  it("llama deleteProductImage con id y storage_path al eliminar", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    await userEvent.click(screen.getByRole("button", { name: /eliminar imagen 1/i }));

    await waitFor(() =>
      expect(service.deleteProductImage).toHaveBeenCalledWith(
        "img-1",
        "products/prod-1/a.jpg",
      ),
    );
  });

  it("renormaliza sort_orders via batchUpdateSortOrder tras eliminar", async () => {
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    await userEvent.click(screen.getByRole("button", { name: /eliminar imagen 1/i }));

    await waitFor(() =>
      expect(service.batchUpdateSortOrder).toHaveBeenCalledWith("prod-1", ["img-2"]),
    );
  });

  it("muestra toast de error cuando deleteProductImage falla", async () => {
    const { toast } = await import("sonner");
    vi.mocked(service.deleteProductImage).mockRejectedValue(
      new Error("RLS denied"),
    );
    render(<ImageGalleryManager productId="prod-1" />);
    await waitFor(() => screen.getAllByRole("listitem"));

    await userEvent.click(screen.getByRole("button", { name: /eliminar imagen 1/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("RLS denied"),
    );
  });
});
