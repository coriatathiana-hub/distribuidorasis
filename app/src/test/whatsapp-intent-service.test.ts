import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({
  insert: insertMock,
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: fromMock,
  },
}));

const QUEUE_KEY = "sis.whatsapp_intent_queue.v1";

async function loadService() {
  vi.resetModules();
  return import("@/lib/api/whatsapp-intent-service");
}

describe("HU-5.6 whatsapp-intent-service reliability", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    insertMock.mockReset();
    insertMock.mockResolvedValue({ error: null });
    fromMock.mockClear();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => (key in storage ? storage[key] : null),
        setItem: (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: (key: string) => {
          delete storage[key];
        },
        clear: () => {
          storage = {};
        },
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("removes event from queue when keepalive write succeeds", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
    const { trackWhatsAppIntent } = await loadService();

    await trackWhatsAppIntent({
      source: "/",
      contextType: "floating_button",
      prefilledMessage: "Hola",
      openedSuccessfully: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(insertMock).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(QUEUE_KEY)).toBe("[]");
  });

  it("keeps failed event and flushes it on online recovery", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    insertMock.mockResolvedValueOnce({
      error: { code: "57014", message: "timeout" },
    });
    insertMock.mockResolvedValueOnce({ error: null });

    const { trackWhatsAppIntent } = await loadService();

    await trackWhatsAppIntent({
      source: "/contacto",
      contextType: "contact_card",
      prefilledMessage: "Hola, me interesa cotizar",
      openedSuccessfully: false,
    });

    const firstQueueSnapshot = window.localStorage.getItem(QUEUE_KEY) ?? "[]";
    expect(JSON.parse(firstQueueSnapshot)).toHaveLength(1);

    window.dispatchEvent(new Event("online"));
    await Promise.resolve();
    await Promise.resolve();

    const finalQueueSnapshot = window.localStorage.getItem(QUEUE_KEY) ?? "[]";
    expect(JSON.parse(finalQueueSnapshot)).toHaveLength(0);
    expect(insertMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
