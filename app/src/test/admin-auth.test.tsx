/**
 * HU-2.2 — Scenario 1 & 3: AdminOtpLogin component behavior
 * Tests the two-step OTP login UI:
 *   Step 1 — email request form
 *   Step 2 — OTP verification form + retry
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AdminOtpLogin from "@/components/admin/AdminOtpLogin";
import * as auth from "@/lib/supabase/auth";

vi.mock("@/lib/supabase/auth", () => ({
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
  signOutAdmin: vi.fn(),
  getAdminProfile: vi.fn(),
}));

const mockedRequestOtp = vi.mocked(auth.requestOtp);
const mockedVerifyOtp = vi.mocked(auth.verifyOtp);

function renderLogin(onSuccess = vi.fn()) {
  return render(
    <MemoryRouter>
      <AdminOtpLogin onSuccess={onSuccess} />
    </MemoryRouter>,
  );
}

describe("HU-2.2 Scenario 1 & 3: AdminOtpLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email step initially", () => {
    renderLogin();
    expect(
      screen.getByRole("heading", { name: /acceso administrativo/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /solicitar código/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/código de acceso/i)).not.toBeInTheDocument();
  });

  it("shows OTP input after successful email request", async () => {
    mockedRequestOtp.mockResolvedValue({ error: null });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "admin@sis.com");
    await userEvent.click(screen.getByRole("button", { name: /solicitar código/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/código de acceso/i)).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /verificar e ingresar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /solicitar nuevo código/i }),
    ).toBeInTheDocument();
  });

  it("shows error when OTP request fails", async () => {
    mockedRequestOtp.mockResolvedValue({
      error: "No se pudo enviar el código. Verifica el correo e intenta de nuevo.",
    });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "noexiste@sis.com");
    await userEvent.click(screen.getByRole("button", { name: /solicitar código/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /no se pudo enviar el código/i,
    );
    expect(screen.queryByLabelText(/código de acceso/i)).not.toBeInTheDocument();
  });

  it("calls onSuccess when OTP is verified successfully", async () => {
    const onSuccess = vi.fn();
    mockedRequestOtp.mockResolvedValue({ error: null });
    mockedVerifyOtp.mockResolvedValue({ error: null, isAdmin: true });

    renderLogin(onSuccess);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "admin@sis.com");
    await userEvent.click(screen.getByRole("button", { name: /solicitar código/i }));
    await waitFor(() => screen.getByLabelText(/código de acceso/i));

    await userEvent.type(screen.getByLabelText(/código de acceso/i), "123456");
    await userEvent.click(screen.getByRole("button", { name: /verificar e ingresar/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error on invalid or expired OTP code (Scenario 3)", async () => {
    mockedRequestOtp.mockResolvedValue({ error: null });
    mockedVerifyOtp.mockResolvedValue({
      error: "Código inválido o expirado. Solicita uno nuevo.",
      isAdmin: false,
    });

    renderLogin();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "admin@sis.com");
    await userEvent.click(screen.getByRole("button", { name: /solicitar código/i }));
    await waitFor(() => screen.getByLabelText(/código de acceso/i));

    await userEvent.type(screen.getByLabelText(/código de acceso/i), "000000");
    await userEvent.click(screen.getByRole("button", { name: /verificar e ingresar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/código inválido o expirado/i);
    });
    expect(screen.getByLabelText(/código de acceso/i)).toHaveValue("");
  });

  it("retry button resets to email step", async () => {
    mockedRequestOtp.mockResolvedValue({ error: null });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "admin@sis.com");
    await userEvent.click(screen.getByRole("button", { name: /solicitar código/i }));
    await waitFor(() => screen.getByRole("button", { name: /solicitar nuevo código/i }));

    await userEvent.click(screen.getByRole("button", { name: /solicitar nuevo código/i }));

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/código de acceso/i)).not.toBeInTheDocument();
  });
});
