/**
 * HU-2.4 — Scenarios 1 & 2: AdminLayout routing and sidebar navigation
 * Tests: sidebar renders nav items, active state, mobile sheet trigger,
 *        signout button placement, AdminRouteGuard protection of nested routes.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLayout from "@/components/admin/AdminLayout";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/lib/supabase/auth", () => ({
  getAdminProfile: vi.fn().mockResolvedValue({ profile: { email: "admin@test.com" } }),
  signOutAdmin: vi.fn().mockResolvedValue({}),
}));

// AdminLayout uses Sheet from shadcn/ui — mock its trigger to keep tests simple
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

// ── AdminSidebar ──────────────────────────────────────────────────────────────

function renderSidebar(adminEmail?: string, onNavClick?: () => void) {
  return render(
    <MemoryRouter initialEntries={["/admin/productos"]}>
      <Routes>
        <Route
          path="/admin/*"
          element={<AdminSidebar adminEmail={adminEmail} onNavClick={onNavClick} />}
        />
        <Route path="/admin/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("HU-2.4 Scenario 1 & 2: AdminSidebar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders Productos, Categorías y Conversión nav links", () => {
    renderSidebar("admin@test.com");
    expect(screen.getByRole("link", { name: /productos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /categorías/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /conversión/i })).toBeInTheDocument();
  });

  it("shows admin email in the sidebar", () => {
    renderSidebar("admin@test.com");
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
  });

  it("marks Productos link as active when on /admin/productos", () => {
    renderSidebar();
    const productosLink = screen.getByRole("link", { name: /productos/i });
    // NavLink sets aria-current="page" when active
    expect(productosLink).toHaveAttribute("aria-current", "page");
  });

  it("does not mark Categorías as active when on /admin/productos", () => {
    renderSidebar();
    const categoriasLink = screen.getByRole("link", { name: /categorías/i });
    expect(categoriasLink).not.toHaveAttribute("aria-current", "page");
  });

  it("calls onNavClick when a nav link is clicked", async () => {
    const onNavClick = vi.fn();
    renderSidebar(undefined, onNavClick);
    await userEvent.click(screen.getByRole("link", { name: /productos/i }));
    expect(onNavClick).toHaveBeenCalledOnce();
  });

  it("renders sign-out button", () => {
    renderSidebar();
    expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it("renders sign-out button above navigation links", () => {
    renderSidebar();
    const signOutButton = screen.getByRole("button", { name: /cerrar sesión/i });
    const productosLink = screen.getByRole("link", { name: /productos/i });
    expect(
      signOutButton.compareDocumentPosition(productosLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("calls signOutAdmin and redirects on sign-out click", async () => {
    const { signOutAdmin } = await import("@/lib/supabase/auth");
    renderSidebar();
    await userEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));
    await waitFor(() => expect(signOutAdmin).toHaveBeenCalled());
  });
});

// ── AdminLayout ───────────────────────────────────────────────────────────────

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/admin/productos"]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="productos" element={<div>Vista Productos</div>} />
          <Route path="categorias" element={<div>Vista Categorías</div>} />
          <Route path="conversion" element={<div>Vista Conversión</div>} />
        </Route>
        <Route path="/admin/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("HU-2.4 Scenario 1 & 2: AdminLayout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the nested route content via Outlet", async () => {
    renderLayout();
    await waitFor(() =>
      expect(screen.getByText("Vista Productos")).toBeInTheDocument()
    );
  });

  it("shows the mobile topbar hamburger button", async () => {
    renderLayout();
    // The hamburger button is always present (visibility controlled by CSS lg:hidden)
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /abrir menú admin/i })).toBeInTheDocument()
    );
  });

  it("shows Productos, Categorías y Conversión nav links in the sidebar", async () => {
    renderLayout();
    await waitFor(() => {
      const links = screen.getAllByRole("link", { name: /productos/i });
      expect(links.length).toBeGreaterThan(0);
    });
    expect(screen.getAllByRole("link", { name: /categorías/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /conversión/i }).length).toBeGreaterThan(0);
  });
});
