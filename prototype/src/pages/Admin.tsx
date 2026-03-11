import { Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryManager from "@/components/admin/CategoryManager";
import ProductManager from "@/components/admin/ProductManager";
import { PRODUCTS, CATEGORIES } from "@/data/products";

const Admin = () => {
  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Panel de Administración
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión de catálogo y productos
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Panel de Demostración</CardTitle>
          <CardDescription>
            Este panel muestra los productos y categorías actuales del catálogo público.
            Los cambios aquí son solo demostrativos y no afectan el catálogo real.
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
                {PRODUCTS.filter(p => p.image).length}
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
