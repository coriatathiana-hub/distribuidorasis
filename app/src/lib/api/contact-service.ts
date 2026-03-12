import { supabase } from "@/lib/supabase/client";
import type { InsertContactRequest } from "@/types/supabase";

export interface ContactSubmissionInput {
  nombre: string;
  empresa: string;
  telefono: string;
  correo: string;
  tipoRequerimiento: string;
  mensaje: string;
  source?: string;
}

export interface ContactSubmissionResult {
  success: boolean;
  requestId: string;
  emailId: string | null;
}

const CONTACT_REQUEST_TIMEOUT_MS = 8000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error("timeout")), ms);

    promise
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export function mapContactSubmissionToInsert(
  payload: ContactSubmissionInput,
): InsertContactRequest {
  return {
    full_name: payload.nombre.trim(),
    company: payload.empresa.trim() || null,
    phone: payload.telefono.trim(),
    email: payload.correo.trim().toLowerCase(),
    request_type: payload.tipoRequerimiento.trim(),
    message: payload.mensaje.trim(),
    source: payload.source ?? "web_form",
    status: "new",
  };
}

function normalizeErrorMessage(rawMessage?: string): string {
  const message = rawMessage?.toLowerCase() ?? "";
  if (message.includes("function not found")) {
    return "El servicio de contacto no está disponible en este entorno.";
  }
  if (message.includes("non-2xx")) {
    return "El servicio de contacto devolvió un error al procesar la solicitud.";
  }
  if (message.includes("timeout")) {
    return "El servicio de contacto tardó demasiado en responder. Intenta nuevamente.";
  }
  if (message.includes("failed to fetch") || message.includes("network")) {
    return "No fue posible conectar con el servicio de contacto.";
  }
  return rawMessage ?? "No se pudo procesar la solicitud de contacto.";
}

export async function submitContactRequest(
  payload: ContactSubmissionInput,
): Promise<ContactSubmissionResult> {
  let response: Awaited<ReturnType<typeof supabase.functions.invoke>>;
  try {
    response = await withTimeout(
      supabase.functions.invoke("send-contact-email", {
        body: mapContactSubmissionToInsert(payload),
      }),
      CONTACT_REQUEST_TIMEOUT_MS,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : undefined;
    throw new Error(normalizeErrorMessage(message));
  }

  const { data, error } = response;

  if (error) {
    throw new Error(normalizeErrorMessage(error.message));
  }

  if (!data || typeof data !== "object" || !("success" in data) || !data.success) {
    throw new Error("El servicio de contacto devolvió una respuesta inválida.");
  }

  if (!("requestId" in data) || typeof data.requestId !== "string" || data.requestId.length === 0) {
    throw new Error("El servicio de contacto no devolvió el identificador de solicitud.");
  }

  const emailId =
    "emailId" in data && typeof data.emailId === "string" ? data.emailId : null;

  return {
    success: true,
    requestId: data.requestId,
    emailId,
  };
}
