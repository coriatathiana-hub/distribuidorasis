import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAdminConversionDashboard,
  type ConversionFilters,
} from "@/lib/api/admin-conversion-service";

type QueryResult = {
  data: unknown;
  error: { message: string; code?: string } | null;
};

function makeChain(result: QueryResult) {
  const chain: Record<string, unknown> = {
    select: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    then: (onFulfilled: (v: QueryResult) => unknown) =>
      Promise.resolve(result).then(onFulfilled),
    catch: (onRejected: (e: unknown) => unknown) =>
      Promise.resolve(result).catch(onRejected),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const getSupabase = async () => (await import("@/lib/supabase/client")).supabase;

const DEFAULT_FILTERS: ConversionFilters = {
  dateFrom: "",
  dateTo: "",
  channel: "all",
  whatsappOpenState: "all",
  limit: 100,
};

describe("admin-conversion-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns merged dashboard metrics and sorted events", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from)
      .mockReturnValueOnce(
        makeChain({
          data: [
            {
              id: "c-1",
              full_name: "Juan Perez",
              request_type: "cotizacion",
              source: "web_form",
              status: "new",
              created_at: "2026-03-11T19:10:00.000Z",
            },
          ],
          error: null,
        }) as ReturnType<typeof sb.from>,
      )
      .mockReturnValueOnce(
        makeChain({
          data: [
            {
              id: "w-1",
              source: "/producto",
              context_type: "product_detail",
              product_name: "Arnés",
              opened_successfully: true,
              created_at: "2026-03-11T19:20:00.000Z",
            },
          ],
          error: null,
        }) as ReturnType<typeof sb.from>,
      );

    const result = await getAdminConversionDashboard(DEFAULT_FILTERS);

    expect(result.kpis.contactRequests).toBe(1);
    expect(result.kpis.whatsappAttempts).toBe(1);
    expect(result.kpis.approxFormVsWhatsAppRate).toBe(100);
    expect(result.events).toHaveLength(2);
    expect(result.events[0].id).toBe("w-1");
    expect(result.events[1].id).toBe("c-1");
  });

  it("applies whatsapp opened filter when channel includes whatsapp data", async () => {
    const sb = await getSupabase();
    const whatsappChain = makeChain({ data: [], error: null });
    vi.mocked(sb.from)
      .mockReturnValueOnce(
        makeChain({ data: [], error: null }) as ReturnType<typeof sb.from>,
      )
      .mockReturnValueOnce(whatsappChain as ReturnType<typeof sb.from>);

    await getAdminConversionDashboard({
      ...DEFAULT_FILTERS,
      whatsappOpenState: "blocked",
    });

    expect(whatsappChain.eq).toHaveBeenCalledWith("opened_successfully", false);
  });

  it("throws actionable error when contact query fails", async () => {
    const sb = await getSupabase();
    vi.mocked(sb.from).mockReturnValue(
      makeChain({
        data: null,
        error: { message: "RLS denied" },
      }) as ReturnType<typeof sb.from>,
    );

    await expect(getAdminConversionDashboard(DEFAULT_FILTERS)).rejects.toThrow(
      "RLS denied",
    );
  });
});
