import { NavLink, useNavigate } from "react-router-dom";
import { FolderOpen, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOutAdmin } from "@/lib/supabase/auth";

const NAV_ITEMS = [
  { to: "/admin/productos", label: "Productos", icon: Package },
  { to: "/admin/categorias", label: "Categorías", icon: FolderOpen },
] as const;

interface AdminSidebarProps {
  adminEmail?: string | null;
  /** Called after a nav link is clicked — used to close the mobile sheet. */
  onNavClick?: () => void;
}

const AdminSidebar = ({ adminEmail, onNavClick }: AdminSidebarProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
    } catch {
      // signout errors are non-critical
    }
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-5 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Distribuidora SIS
        </p>
        <p className="mt-0.5 text-base font-bold text-foreground">Backoffice</p>
        {adminEmail && (
          <p className="mt-1.5 truncate text-xs text-muted-foreground" title={adminEmail}>
            {adminEmail}
          </p>
        )}
      </div>

      <div className="mx-3 h-px bg-border" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Menú de administración">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
            aria-label={label}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="mt-auto px-3 pb-5">
        <div className="mb-3 h-px bg-border" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
