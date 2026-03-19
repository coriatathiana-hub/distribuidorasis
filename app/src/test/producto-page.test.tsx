import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Producto from "@/pages/Producto";
import * as service from "@/lib/api/public-catalog-service";
import type { PublicProduct } from "@/lib/api/public-catalog-service";

const trackWhatsAppIntentMock = vi.fn();
const toastMock = vi.fn();

vi.mock("@/lib/api/public-catalog-service");
vi.mock("@/lib/api/whatsapp-intent-service", () => ({
  trackWhatsAppIntent: (...args: unknown[]) => trackWhatsAppIntentMock(...args),
  buildIntentInputFromContext: (
    context: {
      source: string;
      contextType: string;
      productSlug?: string;
      productName?: string;
    },
    prefilledMessage: string,
    openedSuccessfully: boolean,
  ) => ({
    ...context,
    prefilledMessage,
    openedSuccessfully,
  }),
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: (...args: unknown[]) => toastMock(...args),
  }),
}));

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
  ],
};

function renderProducto() {
  return render(
    <MemoryRouter initialEntries={["/producto/arnes-3-aros"]}>
      <Routes>
        <Route path="/producto/:id" element={<Producto />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("HU-4.3 CTA WhatsApp en detalle de producto", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(service.getProductBySlug).mockResolvedValue(MOCK_PRODUCT);
    trackWhatsAppIntentMock.mockReset();
    toastMock.mockReset();
  });

  it("abre WhatsApp con mensaje contextual del producto y registra intento exitoso", async () => {
    const openSpy = vi
      .spyOn(window, "open")
      .mockReturnValue({ closed: false } as Window);

    renderProducto();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Arnés de Seguridad 3 Aros" }),
      ).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", {
        name: "Contactar por WhatsApp sobre este producto",
      }),
    );

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy.mock.calls[0][0]).toContain("https://wa.me/");
    expect(openSpy.mock.calls[0][0]).toContain(
      "Hola%2C%20me%20interesa%20cotizar%20el%20producto%20%22Arn%C3%A9s%20de%20Seguridad%203%20Aros%22%20(ID%3A%20arnes-3-aros).",
    );
    expect(trackWhatsAppIntentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "/producto",
        contextType: "product_detail",
        productSlug: "arnes-3-aros",
        productName: "Arnés de Seguridad 3 Aros",
        openedSuccessfully: true,
      }),
    );
  });
});
