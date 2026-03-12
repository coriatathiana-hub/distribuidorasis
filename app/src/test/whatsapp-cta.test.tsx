import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contacto from "@/pages/Contacto";
import WhatsAppButton from "@/components/WhatsAppButton";

const trackWhatsAppIntentMock = vi.fn();
const toastMock = vi.fn();

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

describe("HU-4.3 WhatsApp CTA component behavior", () => {
  beforeEach(() => {
    trackWhatsAppIntentMock.mockReset();
    toastMock.mockReset();
    vi.restoreAllMocks();
  });

  it("opens floating WhatsApp CTA with default message and tracks success", async () => {
    const openSpy = vi
      .spyOn(window, "open")
      .mockReturnValue({ closed: false } as Window);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <WhatsAppButton />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Contactar por WhatsApp" }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy.mock.calls[0][0]).toContain("https://wa.me/");
    expect(openSpy.mock.calls[0][0]).toContain(
      "Hola%2C%20me%20gustar%C3%ADa%20solicitar%20informaci%C3%B3n%20sobre%20sus%20productos%20y%20servicios.",
    );
    expect(trackWhatsAppIntentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "/",
        contextType: "floating_button",
        openedSuccessfully: true,
      }),
    );
    expect(toastMock).not.toHaveBeenCalled();
  });

  it("shows fallback toast when Contacto WhatsApp CTA cannot open deeplink", async () => {
    vi.spyOn(window, "open").mockReturnValue(null);

    render(
      <MemoryRouter
        initialEntries={[
          "/contacto?producto=Arnes%20Industrial&productoId=arnes-industrial",
        ]}
      >
        <Contacto />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Abrir WhatsApp" }));

    await waitFor(() => {
      expect(trackWhatsAppIntentMock).toHaveBeenCalledTimes(1);
    });

    expect(trackWhatsAppIntentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "/contacto",
        contextType: "contact_card",
        productSlug: "arnes-industrial",
        productName: "Arnes Industrial",
        openedSuccessfully: false,
      }),
    );
    expect(toastMock).toHaveBeenCalledWith({
      title: "No se pudo abrir WhatsApp",
      description:
        "Tu navegador bloqueó la apertura. Puedes continuar con el formulario de contacto.",
      variant: "destructive",
    });
  });
});
