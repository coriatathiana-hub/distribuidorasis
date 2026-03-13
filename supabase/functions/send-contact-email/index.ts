import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type ContactRequestInsert = {
  full_name: string;
  company: string | null;
  phone: string;
  email: string;
  request_type: string;
  message: string;
  source?: string;
  status?: string;
};

const baseCorsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getCorsHeaders(request: Request): Record<string, string> {
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  const requestOrigin = request.headers.get("origin");

  // Backward compatible default for local/dev environments.
  if (allowedOrigins.length === 0) {
    return {
      ...baseCorsHeaders,
      "Access-Control-Allow-Origin": "*",
    };
  }

  if (!requestOrigin) {
    return {
      ...baseCorsHeaders,
      "Access-Control-Allow-Origin": allowedOrigins[0],
      Vary: "Origin",
    };
  }

  return {
    ...baseCorsHeaders,
    "Access-Control-Allow-Origin": allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : "null",
    Vary: "Origin",
  };
}

function badRequest(message: string, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}

function serverError(
  corsHeaders: Record<string, string>,
  message = "No se pudo procesar la solicitud de contacto.",
) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toStringValue(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function parsePayload(payload: unknown): ContactRequestInsert | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, unknown>;

  const fullName = toStringValue(body.full_name);
  const phone = toStringValue(body.phone);
  const email = toStringValue(body.email).toLowerCase();
  const requestType = toStringValue(body.request_type);
  const message = toStringValue(body.message);
  const companyRaw = toStringValue(body.company);
  const sourceRaw = toStringValue(body.source);
  const statusRaw = toStringValue(body.status);

  if (!fullName || !phone || !email || !requestType || !message) {
    return null;
  }

  return {
    full_name: fullName,
    company: companyRaw || null,
    phone,
    email,
    request_type: requestType,
    message,
    source: sourceRaw || "web_form",
    status: statusRaw || "new",
  };
}

function buildHtmlEmail(payload: ContactRequestInsert): string {
  return `
    <h2>Nueva solicitud de contacto</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(payload.full_name)}</p>
    <p><strong>Empresa:</strong> ${escapeHtml(payload.company ?? "N/A")}</p>
    <p><strong>Teléfono:</strong> ${escapeHtml(payload.phone)}</p>
    <p><strong>Correo:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Tipo de requerimiento:</strong> ${escapeHtml(payload.request_type)}</p>
    <p><strong>Fuente:</strong> ${escapeHtml(payload.source ?? "web_form")}</p>
    <hr />
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(payload.message).replaceAll("\n", "<br />")}</p>
  `;
}

Deno.serve(async (request: Request) => {
  const corsHeaders = getCorsHeaders(request);

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return badRequest("Método no soportado.", corsHeaders);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const contactEmailTo = Deno.env.get("CONTACT_EMAIL_TO");
  const contactEmailFrom = Deno.env.get("CONTACT_EMAIL_FROM");

  if (
    !supabaseUrl ||
    !supabaseServiceRoleKey ||
    !resendApiKey ||
    !contactEmailTo ||
    !contactEmailFrom
  ) {
    return serverError(corsHeaders, "Configuración incompleta del servicio de contacto.");
  }

  let payload: ContactRequestInsert | null = null;
  try {
    payload = parsePayload(await request.json());
  } catch {
    return badRequest("Payload JSON inválido.", corsHeaders);
  }

  if (!payload) {
    return badRequest("Faltan campos obligatorios de contacto.", corsHeaders);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: row, error: insertError } = await supabase
    .from("contact_requests")
    .insert(payload)
    .select("id")
    .single();

  if (insertError || !row) {
    return serverError(corsHeaders);
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: contactEmailFrom,
      to: [contactEmailTo],
      subject: "Nueva solicitud FEAT-4 — Distribuidora SIS",
      html: buildHtmlEmail(payload),
      reply_to: payload.email,
    }),
  });

  if (!resendResponse.ok) {
    return serverError(
      corsHeaders,
      "No se pudo enviar el correo de notificación. Tu solicitud fue registrada.",
    );
  }

  const resendBody = (await resendResponse.json()) as { id?: string };

  return new Response(
    JSON.stringify({
      success: true,
      requestId: row.id,
      emailId: resendBody.id ?? null,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
});
