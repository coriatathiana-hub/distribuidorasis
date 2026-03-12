import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mapContactSubmissionToInsert,
  submitContactRequest,
  type ContactSubmissionInput,
} from "@/lib/api/contact-service";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const getInvokeMock = async () => {
  const mod = await import("@/lib/supabase/client");
  return vi.mocked(mod.supabase.functions.invoke);
};

const basePayload: ContactSubmissionInput = {
  nombre: "  Juan Perez  ",
  empresa: " Constructora ABC ",
  telefono: "5512345678",
  correo: "Juan@Empresa.com",
  tipoRequerimiento: "cotizacion",
  mensaje: "Necesito una cotizacion de productos de seguridad.",
};

describe("mapContactSubmissionToInsert", () => {
  it("maps and normalizes form payload to contact_requests insert shape", () => {
    const mapped = mapContactSubmissionToInsert(basePayload);

    expect(mapped).toEqual({
      full_name: "Juan Perez",
      company: "Constructora ABC",
      phone: "5512345678",
      email: "juan@empresa.com",
      request_type: "cotizacion",
      message: "Necesito una cotizacion de productos de seguridad.",
      source: "web_form",
      status: "new",
    });
  });

  it("sets company as null when empty", () => {
    const mapped = mapContactSubmissionToInsert({
      ...basePayload,
      empresa: "   ",
    });

    expect(mapped.company).toBeNull();
  });
});

describe("submitContactRequest", () => {
  beforeEach(async () => {
    const invoke = await getInvokeMock();
    invoke.mockReset();
  });

  it("returns requestId and emailId on successful function response", async () => {
    const invoke = await getInvokeMock();
    invoke.mockResolvedValue({
      data: { success: true, requestId: "req-123", emailId: "re_abc" },
      error: null,
    });

    const result = await submitContactRequest(basePayload);

    expect(result).toEqual({
      success: true,
      requestId: "req-123",
      emailId: "re_abc",
    });
    expect(invoke).toHaveBeenCalledWith("send-contact-email", {
      body: expect.objectContaining({
        full_name: "Juan Perez",
        email: "juan@empresa.com",
      }),
    });
  });

  it("throws normalized error when function invoke fails", async () => {
    const invoke = await getInvokeMock();
    invoke.mockResolvedValue({
      data: null,
      error: { message: "Function not found" },
    });

    await expect(submitContactRequest(basePayload)).rejects.toThrow(
      "El servicio de contacto no está disponible en este entorno.",
    );
  });

  it("throws when response shape is invalid", async () => {
    const invoke = await getInvokeMock();
    invoke.mockResolvedValue({
      data: { success: true, emailId: "re_only" },
      error: null,
    });

    await expect(submitContactRequest(basePayload)).rejects.toThrow(
      "El servicio de contacto no devolvió el identificador de solicitud.",
    );
  });

  it("throws when success is false", async () => {
    const invoke = await getInvokeMock();
    invoke.mockResolvedValue({
      data: { success: false, error: "provider down" },
      error: null,
    });

    await expect(submitContactRequest(basePayload)).rejects.toThrow(
      "El servicio de contacto devolvió una respuesta inválida.",
    );
  });
});
