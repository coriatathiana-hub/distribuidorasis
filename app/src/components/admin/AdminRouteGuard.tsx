import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type AuthState = "loading" | "authorized" | "unauthorized";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Protects admin routes by verifying:
 *   1. Active Supabase session.
 *   2. Matching public.profiles row with role='admin' and is_active=true.
 * Redirects to /admin/login on any failure, signing out if a session exists but is not authorized.
 */
const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (mounted) {
          setAuthState("unauthorized");
          navigate("/admin/login", { replace: true });
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", session.user.id)
        .single();

      if (!mounted) return;

      if (profile?.role === "admin" && profile?.is_active === true) {
        setAuthState("authorized");
      } else {
        await supabase.auth.signOut();
        setAuthState("unauthorized");
        navigate("/admin/login", { replace: true });
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && mounted) {
        setAuthState("unauthorized");
        navigate("/admin/login", { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (authState === "loading") {
    return (
      <div
        className="flex min-h-[calc(100vh-8rem)] items-center justify-center"
        aria-label="Verificando acceso"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authState === "unauthorized") {
    return null;
  }

  return <>{children}</>;
};

export default AdminRouteGuard;
