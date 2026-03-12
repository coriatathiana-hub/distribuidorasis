import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConversionDashboard from "@/components/admin/ConversionDashboard";

const getAdminConversionDashboardMock = vi.fn();

vi.mock("@/lib/api/admin-conversion-service", () => ({
  getAdminConversionDashboard: (...args: unknown[]) =>
    getAdminConversionDashboardMock(...args),
}));

describe("HU-4.4 ConversionDashboard", () => {
  beforeEach(() => {
    getAdminConversionDashboardMock.mockReset();
  });

  it("renders KPI cards and table rows from dashboard data", async () => {
    getAdminConversionDashboardMock.mockResolvedValue({
      kpis: {
        contactRequests: 4,
        whatsappAttempts: 10,
        approxFormVsWhatsAppRate: 40,
      },
      events: [
        {
          id: "w-1",
          createdAt: "2026-03-11T19:20:00.000Z",
          channel: "whatsapp_cta",
          source: "/producto",
          context: "product_detail",
          summary: "Producto: Arnés",
          status: "opened",
        },
      ],
    });

    render(<ConversionDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Conversión Omnicanal")).toBeInTheDocument();
    });

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("Producto: Arnés")).toBeInTheDocument();
  });

  it("reloads data when channel filter changes", async () => {
    getAdminConversionDashboardMock.mockResolvedValue({
      kpis: {
        contactRequests: 0,
        whatsappAttempts: 0,
        approxFormVsWhatsAppRate: 0,
      },
      events: [],
    });

    render(<ConversionDashboard />);

    await waitFor(() => {
      expect(getAdminConversionDashboardMock).toHaveBeenCalledTimes(1);
    });

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Canal"), "whatsapp_cta");

    await waitFor(() => {
      expect(getAdminConversionDashboardMock).toHaveBeenCalledTimes(2);
    });
  });

  it("shows recoverable error state and retries load", async () => {
    getAdminConversionDashboardMock
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({
        kpis: {
          contactRequests: 1,
          whatsappAttempts: 1,
          approxFormVsWhatsAppRate: 100,
        },
        events: [],
      });

    render(<ConversionDashboard />);

    await waitFor(() => {
      expect(screen.getByText("network down")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => {
      expect(getAdminConversionDashboardMock).toHaveBeenCalledTimes(2);
    });
  });
});
