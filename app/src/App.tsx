import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Producto from "./pages/Producto";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProductos from "./pages/AdminProductos";
import AdminCategorias from "./pages/AdminCategorias";
import AdminConversion from "./pages/AdminConversion";
import Privacidad from "./pages/Privacidad";
import NotFound from "./pages/NotFound";
import AdminRouteGuard from "./components/admin/AdminRouteGuard";

const queryClient = new QueryClient();

/** Wraps public routes with the shared Layout (Header + Footer + WhatsApp). */
const PublicLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ── Admin routes — own layout, no public header/footer ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <AdminLayout />
              </AdminRouteGuard>
            }
          >
            {/* Default: /admin → /admin/productos */}
            <Route index element={<Navigate to="productos" replace />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="conversion" element={<AdminConversion />} />
            {/* Catch-all for unrecognized admin sub-routes */}
            <Route path="*" element={<Navigate to="productos" replace />} />
          </Route>

          {/* ── Public routes — shared Layout (Header + Footer + WhatsApp) ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
