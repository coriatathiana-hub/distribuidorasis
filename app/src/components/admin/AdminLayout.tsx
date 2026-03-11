import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AdminSidebar from "./AdminSidebar";
import { getAdminProfile } from "@/lib/supabase/auth";

/**
 * Shell for all /admin/* routes.
 * Desktop: fixed 240 px sidebar + scrollable main area.
 * Mobile: topbar with hamburger + Sheet drawer sidebar.
 * Renders <Outlet /> for nested routes (/admin/productos, /admin/categorias).
 */
const AdminLayout = () => {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getAdminProfile().then(({ profile }) => {
      if (profile) setAdminEmail(profile.email);
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:bg-card"
        aria-label="Barra lateral de administración"
      >
        <AdminSidebar adminEmail={adminEmail} />
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú admin"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SheetContent side="left" className="w-60 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menú de administración</SheetTitle>
              </SheetHeader>
              <AdminSidebar
                adminEmail={adminEmail}
                onNavClick={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" aria-hidden />
            <span className="font-semibold text-foreground">Backoffice SIS</span>
          </div>
        </header>

        {/* Page content — nested route renders here */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
