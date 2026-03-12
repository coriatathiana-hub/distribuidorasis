import { supabase } from "@/lib/supabase/client";

export type ConversionChannelFilter = "all" | "email_form" | "whatsapp_cta";
export type WhatsAppOpenFilter = "all" | "opened" | "blocked";

export interface ConversionFilters {
  dateFrom?: string;
  dateTo?: string;
  channel: ConversionChannelFilter;
  whatsappOpenState: WhatsAppOpenFilter;
  limit: number;
}

export interface ConversionKpis {
  contactRequests: number;
  whatsappAttempts: number;
  approxFormVsWhatsAppRate: number;
}

export interface ConversionEventRow {
  id: string;
  createdAt: string;
  channel: "email_form" | "whatsapp_cta";
  source: string;
  context: string;
  summary: string;
  status: string;
}

export interface ConversionDashboardData {
  kpis: ConversionKpis;
  events: ConversionEventRow[];
}

type ContactRequestRow = {
  id: string;
  full_name: string;
  request_type: string;
  source: string;
  status: string;
  created_at: string;
};

type WhatsAppAttemptRow = {
  id: string;
  source: string;
  context_type: string;
  product_name: string | null;
  opened_successfully: boolean;
  created_at: string;
};

function buildDateRange(
  query: {
    gte: (column: string, value: string) => unknown;
    lte: (column: string, value: string) => unknown;
  },
  filters: ConversionFilters,
): void {
  if (filters.dateFrom) {
    query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters.dateTo) {
    query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }
}

function mapContactRequestToEvent(row: ContactRequestRow): ConversionEventRow {
  return {
    id: row.id,
    createdAt: row.created_at,
    channel: "email_form",
    source: row.source,
    context: row.request_type,
    summary: row.full_name,
    status: row.status,
  };
}

function mapWhatsAppAttemptToEvent(row: WhatsAppAttemptRow): ConversionEventRow {
  return {
    id: row.id,
    createdAt: row.created_at,
    channel: "whatsapp_cta",
    source: row.source,
    context: row.context_type,
    summary: row.product_name ? `Producto: ${row.product_name}` : "Intento general",
    status: row.opened_successfully ? "opened" : "blocked",
  };
}

function computeRate(contactRequests: number, whatsappAttempts: number): number {
  if (whatsappAttempts === 0) return 0;
  return Math.round((contactRequests / whatsappAttempts) * 100);
}

export async function getAdminConversionDashboard(
  filters: ConversionFilters,
): Promise<ConversionDashboardData> {
  const shouldFetchContact =
    filters.channel === "all" || filters.channel === "email_form";
  const shouldFetchWhatsApp =
    filters.channel === "all" || filters.channel === "whatsapp_cta";

  let contactData: ContactRequestRow[] = [];
  let whatsappData: WhatsAppAttemptRow[] = [];

  if (shouldFetchContact) {
    const contactQuery = supabase
      .from("contact_requests")
      .select("id, full_name, request_type, source, status, created_at")
      .order("created_at", { ascending: false })
      .limit(filters.limit);

    buildDateRange(contactQuery, filters);

    const { data, error } = await contactQuery;
    if (error) {
      throw new Error(error.message);
    }
    contactData = (data ?? []) as ContactRequestRow[];
  }

  if (shouldFetchWhatsApp) {
    const whatsappQuery = supabase
      .from("whatsapp_cta_attempts")
      .select("id, source, context_type, product_name, opened_successfully, created_at")
      .order("created_at", { ascending: false })
      .limit(filters.limit);

    buildDateRange(whatsappQuery, filters);

    if (filters.whatsappOpenState === "opened") {
      whatsappQuery.eq("opened_successfully", true);
    } else if (filters.whatsappOpenState === "blocked") {
      whatsappQuery.eq("opened_successfully", false);
    }

    const { data, error } = await whatsappQuery;
    if (error) {
      throw new Error(error.message);
    }
    whatsappData = (data ?? []) as WhatsAppAttemptRow[];
  }

  const events = [
    ...contactData.map(mapContactRequestToEvent),
    ...whatsappData.map(mapWhatsAppAttemptToEvent),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, filters.limit);

  const kpis: ConversionKpis = {
    contactRequests: contactData.length,
    whatsappAttempts: whatsappData.length,
    approxFormVsWhatsAppRate: computeRate(contactData.length, whatsappData.length),
  };

  return { kpis, events };
}
