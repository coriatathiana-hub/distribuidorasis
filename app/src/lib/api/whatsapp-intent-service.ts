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

interface QueuedWhatsAppIntent extends InsertWhatsAppCtaAttempt {
  event_id: string;
  queued_at: number;
  retry_count: number;
}

const WHATSAPP_QUEUE_STORAGE_KEY = "sis.whatsapp_intent_queue.v1";
const WHATSAPP_QUEUE_MAX_SIZE = 50;
const WHATSAPP_QUEUE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24h

let listenersInitialized = false;
let flushInFlight = false;

function generateEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapIntentToInsert(payload: WhatsAppIntentInput): QueuedWhatsAppIntent {
  return {
    event_id: generateEventId(),
    source: payload.source.trim() || "unknown",
    context_type: payload.contextType,
    product_slug: payload.productSlug?.trim() || null,
    product_name: payload.productName?.trim() || null,
    prefilled_message: payload.prefilledMessage.trim(),
    opened_successfully: payload.openedSuccessfully,
    queued_at: Date.now(),
    retry_count: 0,
  };
}

function getQueue(): QueuedWhatsAppIntent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WHATSAPP_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedWhatsAppIntent[];
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(
      (item) =>
        typeof item?.event_id === "string" &&
        typeof item?.queued_at === "number" &&
        typeof item?.retry_count === "number" &&
        now - item.queued_at <= WHATSAPP_QUEUE_MAX_AGE_MS,
    );
  } catch {
    return [];
  }
}

function setQueue(queue: QueuedWhatsAppIntent[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      WHATSAPP_QUEUE_STORAGE_KEY,
      JSON.stringify(queue.slice(-WHATSAPP_QUEUE_MAX_SIZE)),
    );
  } catch {
    // Best effort queue; storage errors must never block CTA behavior.
  }
}

function enqueueIntent(intent: QueuedWhatsAppIntent): void {
  const queue = getQueue();
  queue.push(intent);
  setQueue(queue);
}

function removeFromQueue(eventId: string): void {
  const queue = getQueue().filter((item) => item.event_id !== eventId);
  setQueue(queue);
}

function incrementRetry(eventId: string): void {
  const queue = getQueue().map((item) =>
    item.event_id === eventId
      ? { ...item, retry_count: Math.min(item.retry_count + 1, 10) }
      : item,
  );
  setQueue(queue);
}

function toInsertPayload(intent: QueuedWhatsAppIntent): InsertWhatsAppCtaAttempt {
  return {
    event_id: intent.event_id,
    source: intent.source,
    context_type: intent.context_type,
    product_slug: intent.product_slug,
    product_name: intent.product_name,
    prefilled_message: intent.prefilled_message,
    opened_successfully: intent.opened_successfully,
  };
}

async function persistViaSupabase(intent: QueuedWhatsAppIntent): Promise<boolean> {
  const { error } = await supabase
    .from("whatsapp_cta_attempts")
    .insert(toInsertPayload(intent));

  if (error) {
    // Unique violation means "already persisted" via keepalive/previous retry.
    if (error.code === "23505") {
      return true;
    }
    return false;
  }

  return true;
}

async function persistViaKeepalive(intent: QueuedWhatsAppIntent): Promise<boolean> {
  if (typeof fetch === "undefined") return false;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) return false;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/whatsapp_cta_attempts?on_conflict=event_id`,
    {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify(toInsertPayload(intent)),
    },
  );

  return response.ok;
}

async function flushIntentQueue(): Promise<void> {
  if (flushInFlight) return;
  flushInFlight = true;
  try {
    const queue = getQueue();
    for (const intent of queue) {
      const persisted = await persistViaSupabase(intent);
      if (persisted) {
        removeFromQueue(intent.event_id);
      } else {
        incrementRetry(intent.event_id);
      }
    }
  } finally {
    flushInFlight = false;
  }
}

function ensureQueueRecoveryListeners(): void {
  if (listenersInitialized || typeof window === "undefined") return;
  listenersInitialized = true;

  window.addEventListener("online", () => {
    void flushIntentQueue();
  });

  window.addEventListener("pagehide", () => {
    void flushIntentQueue();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void flushIntentQueue();
    }
  });
}

export async function trackWhatsAppIntent(payload: WhatsAppIntentInput): Promise<void> {
  const intent = mapIntentToInsert(payload);
  enqueueIntent(intent);
  ensureQueueRecoveryListeners();

  try {
    const persisted = await persistViaKeepalive(intent);
    if (persisted) {
      removeFromQueue(intent.event_id);
      return;
    }
  } catch {
    // Keepalive may fail on some browsers/network conditions.
  }

  const persisted = await persistViaSupabase(intent);
  if (persisted) {
    removeFromQueue(intent.event_id);
    return;
  }

  // Telemetry errors should not block contact intent UX.
  console.warn("[HU-5.6] Failed to track WhatsApp CTA intent");
  void flushIntentQueue();
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
