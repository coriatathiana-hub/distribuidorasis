export type WhatsAppContextType =
  | "floating_button"
  | "contact_card"
  | "product_detail";

export interface WhatsAppMessageContext {
  source: string;
  contextType: WhatsAppContextType;
  productSlug?: string;
  productName?: string;
}

const FALLBACK_PHONE_E164 = "525551627054";
const DEFAULT_WHATSAPP_MESSAGE =
  "Hola, me gustaría solicitar información sobre sus productos y servicios.";

function sanitizePhoneNumber(rawValue?: string): string {
  const normalized = rawValue?.replace(/[^\d]/g, "") ?? "";
  return normalized.length > 0 ? normalized : FALLBACK_PHONE_E164;
}

export function getWhatsAppPhoneNumber(): string {
  return sanitizePhoneNumber(import.meta.env.VITE_WHATSAPP_PHONE_E164 as
    | string
    | undefined);
}

export function buildWhatsAppPrefilledMessage(
  context: WhatsAppMessageContext,
): string {
  if (context.productName?.trim()) {
    const productName = context.productName.trim();
    const suffix = context.productSlug?.trim()
      ? ` (ID: ${context.productSlug.trim()})`
      : "";
    return `Hola, me interesa cotizar el producto "${productName}"${suffix}.`;
  }

  return DEFAULT_WHATSAPP_MESSAGE;
}

export function buildWhatsAppDeepLink(
  phoneNumber: string,
  prefilledMessage: string,
): string {
  const sanitizedPhone = sanitizePhoneNumber(phoneNumber);
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(
    prefilledMessage,
  )}`;
}

export function tryOpenWhatsApp(url: string): boolean {
  try {
    const openedWindow = window.open(url, "_blank", "noopener,noreferrer");

    if (openedWindow) {
      return true;
    }

    // Some browsers may return null even for user-triggered actions.
    // Fallback to same-tab navigation to avoid false "blocked" feedback.
    window.location.href = url;
    return true;
  } catch {
    return false;
  }
}
