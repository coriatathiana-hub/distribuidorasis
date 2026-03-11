import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CategoryManager from "@/components/admin/CategoryManager";
import ProductManager from "@/components/admin/ProductManager";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { getAdminProfile, signOutAdmin } from "@/lib/supabase/auth";

const Admin = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    getAdminProfile().then(({ profile }) => {
      if (profile) setAdminEmail(profile.email);
    });
  }, []);

  const handleSignOut = async () => {
    await signOutAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Panel de Administración
            </h1>
            {adminEmail && (
              <p className="text-sm text-muted-foreground">{adminEmail}</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="shrink-0"
          aria-label="Cerrar sesión"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </Button>
      </div>

      {/* Info Card — will be replaced by real CRUD in HU-2.3 */}
      <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="text-base text-amber-800 dark:text-amber-300">
            Vista de demostración
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-400">
            Autenticación real activa. El catálogo aún usa datos locales — la
            persistencia en Supabase se habilita en la siguiente historia (HU-2.3).
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="products" className="text-base">
            Productos
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-base">
            Categorías
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <ProductManager />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryManager />
        </TabsContent>
      </Tabs>

      {/* Stats Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold text-primary">
                {PRODUCTS.length}
              </div>
              <div className="text-sm text-muted-foreground">Productos</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold text-primary">
                {Object.keys(CATEGORIES).length}
              </div>
              <div className="text-sm text-muted-foreground">Categorías</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold text-primary">
                {PRODUCTS.filter((p) => p.image).length}
              </div>
              <div className="text-sm text-muted-foreground">Imágenes Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
