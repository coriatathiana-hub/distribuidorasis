import { describe, expect, it } from "vitest";
import {
  buildWhatsAppDeepLink,
  buildWhatsAppPrefilledMessage,
} from "@/lib/contact/whatsapp-cta";

describe("HU-4.3 WhatsApp deeplink builder", () => {
  it("builds default message when no product context is provided", () => {
    const message = buildWhatsAppPrefilledMessage({
      source: "/",
      contextType: "floating_button",
    });

    expect(message).toBe(
      "Hola, me gustaría solicitar información sobre sus productos y servicios.",
    );
  });

  it("builds contextual product message when product is available", () => {
    const message = buildWhatsAppPrefilledMessage({
      source: "/producto",
      contextType: "product_detail",
      productSlug: "arnes-3-aros",
      productName: "Arnés de Seguridad 3 Aros",
    });

    expect(message).toBe(
      'Hola, me interesa cotizar el producto "Arnés de Seguridad 3 Aros" (ID: arnes-3-aros).',
    );
  });

  it("builds wa.me deep link with url-encoded message", () => {
    const url = buildWhatsAppDeepLink(
      "52 55 5162 7054",
      'Hola, me interesa cotizar el producto "Arnés de Seguridad 3 Aros".',
    );

    expect(url).toBe(
      "https://wa.me/525551627054?text=Hola%2C%20me%20interesa%20cotizar%20el%20producto%20%22Arn%C3%A9s%20de%20Seguridad%203%20Aros%22.",
    );
  });
});
