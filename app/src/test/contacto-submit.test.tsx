import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Contacto from "@/pages/Contacto";

const submitContactRequestMock = vi.fn();
const toastMock = vi.fn();

vi.mock("@/lib/api/contact-service", () => ({
  submitContactRequest: (...args: unknown[]) => submitContactRequestMock(...args),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: (...args: unknown[]) => toastMock(...args),
  }),
}));

describe("Contacto submit flow (HU-4.1)", () => {
  beforeEach(() => {
    submitContactRequestMock.mockReset();
    toastMock.mockReset();
  });

  async function fillValidForm() {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Nombre Completo *"), "Juan Perez");
    await user.type(screen.getByLabelText("Empresa *"), "Constructora ABC");
    await user.type(screen.getByLabelText("Teléfono *"), "5512345678");
    await user.type(screen.getByLabelText("Correo Electrónico *"), "juan@empresa.com");
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Cotización de Productos" }));
    await user.type(
      screen.getByLabelText("Mensaje *"),
      "Necesito cotizar productos para una obra en CDMX.",
    );

    return user;
  }

  it("submits valid form and shows success feedback", async () => {
    submitContactRequestMock.mockResolvedValue({
      success: true,
      requestId: "req-1",
      emailId: "re_1",
    });

    render(
      <MemoryRouter initialEntries={["/contacto"]}>
        <Contacto />
      </MemoryRouter>,
    );

    const user = await fillValidForm();
    await user.click(screen.getByRole("button", { name: "Enviar Solicitud" }));

    await waitFor(() => {
      expect(submitContactRequestMock).toHaveBeenCalledTimes(1);
    });
    expect(submitContactRequestMock).toHaveBeenCalledWith({
      nombre: "Juan Perez",
      empresa: "Constructora ABC",
      telefono: "5512345678",
      correo: "juan@empresa.com",
      tipoRequerimiento: "cotizacion",
      mensaje: "Necesito cotizar productos para una obra en CDMX.",
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: "Solicitud Enviada",
      description: "Nos pondremos en contacto contigo a la brevedad posible.",
    });
  });

  it("shows controlled error and keeps user input for retry", async () => {
    submitContactRequestMock.mockRejectedValue(
      new Error("No fue posible conectar con el servicio de contacto."),
    );

    render(
      <MemoryRouter initialEntries={["/contacto"]}>
        <Contacto />
      </MemoryRouter>,
    );

    const user = await fillValidForm();
    await user.click(screen.getByRole("button", { name: "Enviar Solicitud" }));

    await waitFor(() => {
      expect(submitContactRequestMock).toHaveBeenCalledTimes(1);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: "Error",
      description: "No fue posible conectar con el servicio de contacto.",
      variant: "destructive",
    });

    expect(screen.getByLabelText("Nombre Completo *")).toHaveValue("Juan Perez");
    expect(screen.getByLabelText("Mensaje *")).toHaveValue(
      "Necesito cotizar productos para una obra en CDMX.",
    );
  });
});
