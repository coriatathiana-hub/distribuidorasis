import { supabase } from "@/lib/supabase/client";
import type { InsertWhatsAppCtaAttempt } from "@/types/supabase";
import type {
  WhatsAppContextType,
  WhatsAppMessageContext,
} from "@/lib/contact/whatsapp-cta";

export interface WhatsAppIntentInput {
  source: string;
  contextType: WhatsAppContextType;
  productSlug?: string;
  productName?: string;
  prefilledMessage: string;
  openedSuccessfully: boolean;
}

function mapIntentToInsert(payload: WhatsAppIntentInput): InsertWhatsAppCtaAttempt {
  return {
    source: payload.source.trim() || "unknown",
    context_type: payload.contextType,
    product_slug: payload.productSlug?.trim() || null,
    product_name: payload.productName?.trim() || null,
    prefilled_message: payload.prefilledMessage.trim(),
    opened_successfully: payload.openedSuccessfully,
  };
}

export async function trackWhatsAppIntent(
  payload: WhatsAppIntentInput,
): Promise<void> {
  const { error } = await supabase
    .from("whatsapp_cta_attempts")
    .insert(mapIntentToInsert(payload));

  if (error) {
    // Telemetry errors should not block contact intent UX.
    console.warn("[HU-4.3] Failed to track WhatsApp CTA intent", error.message);
  }
}

export function buildIntentInputFromContext(
  context: WhatsAppMessageContext,
  prefilledMessage: string,
  openedSuccessfully: boolean,
): WhatsAppIntentInput {
  return {
    source: context.source,
    contextType: context.contextType,
    productSlug: context.productSlug,
    productName: context.productName,
    prefilledMessage,
    openedSuccessfully,
  };
}
