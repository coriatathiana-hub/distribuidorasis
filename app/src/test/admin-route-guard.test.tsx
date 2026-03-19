/**
 * HU-2.2 — Scenario 2: AdminRouteGuard route protection
 * Verifies that:
 *   - Unauthenticated users are redirected to /admin/login
 *   - Authenticated non-admin users are rejected and signed out
 *   - Valid admin users can access protected content
 */
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";

const mockGetSession = vi.fn();
const mockFrom = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      signOut: () => mockSignOut(),
      onAuthStateChange: () => mockOnAuthStateChange(),
    },
    from: () => mockFrom(),
  },
}));

function buildProfileQuery(profile: Record<string, unknown> | null, error = null) {
  const single = vi.fn().mockResolvedValue({ data: profile, error });
  const eq = vi.fn().mockReturnValue({ single });
  const select = vi.fn().mockReturnValue({ eq });
  return { select };
}

function renderGuard(initialEntry = "/admin/productos") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/admin/productos"
          element={
            <AdminRouteGuard>
              <div>Vista Productos</div>
            </AdminRouteGuard>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <AdminRouteGuard>
              <div>Vista Categorías</div>
            </AdminRouteGuard>
          }
        />
        <Route
          path="/admin/conversion"
          element={
            <AdminRouteGuard>
              <div>Vista Conversión</div>
            </AdminRouteGuard>
          }
        />
        <Route path="/admin/login" element={<div>Pantalla de login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("HU-2.2 Scenario 2: AdminRouteGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows spinner while checking authorization", () => {
    mockGetSession.mockReturnValue(new Promise(() => {}));
    renderGuard();
    expect(screen.getByLabelText(/verificando acceso/i)).toBeInTheDocument();
  });

  it("redirects to /admin/login when there is no active session", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    renderGuard();
    await waitFor(() => {
      expect(screen.getByText(/pantalla de login/i)).toBeInTheDocument();
    });
  });

  it("renders children when admin session is valid", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: { user: { id: "uuid-admin" } },
      },
    });
    mockFrom.mockReturnValue(
      buildProfileQuery({ role: "admin", is_active: true }),
    );

    renderGuard();
    await waitFor(() => {
      expect(screen.getByText(/vista productos/i)).toBeInTheDocument();
    });
  });

  it("redirects to /admin/login when authenticated user has no admin role", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: { user: { id: "uuid-noadmin" } },
      },
    });
    mockFrom.mockReturnValue(
      buildProfileQuery({ role: "user", is_active: true }),
    );
    mockSignOut.mockResolvedValue({});

    renderGuard();
    await waitFor(() => {
      expect(screen.getByText(/pantalla de login/i)).toBeInTheDocument();
    });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("redirects to /admin/login when admin profile is inactive", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: { user: { id: "uuid-inactive" } },
      },
    });
    mockFrom.mockReturnValue(
      buildProfileQuery({ role: "admin", is_active: false }),
    );
    mockSignOut.mockResolvedValue({});

    renderGuard();
    await waitFor(() => {
      expect(screen.getByText(/pantalla de login/i)).toBeInTheDocument();
    });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("redirects to /admin/login when profile row is missing", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: { user: { id: "uuid-ghost" } },
      },
    });
    mockFrom.mockReturnValue(buildProfileQuery(null, { message: "not found" }));
    mockSignOut.mockResolvedValue({});

    renderGuard();
    await waitFor(() => {
      expect(screen.getByText(/pantalla de login/i)).toBeInTheDocument();
    });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("redirects restricted admin to /admin/conversion when accessing disallowed module", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: { user: { id: "uuid-restricted" } },
      },
    });
    mockFrom.mockReturnValue(
      buildProfileQuery({
        role: "admin",
        is_active: true,
        allowed_modules: ["conversion"],
      }),
    );

    renderGuard("/admin/productos");
    await waitFor(() => {
      expect(screen.getByText(/vista conversión/i)).toBeInTheDocument();
    });
  });

  it("allows restricted admin when route matches granted module", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: { user: { id: "uuid-restricted" } },
      },
    });
    mockFrom.mockReturnValue(
      buildProfileQuery({
        role: "admin",
        is_active: true,
        allowed_modules: ["conversion"],
      }),
    );

    renderGuard("/admin/conversion");
    await waitFor(() => {
      expect(screen.getByText(/vista conversión/i)).toBeInTheDocument();
    });
  });
});
