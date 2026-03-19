import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, PackageOpen } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { Button } from "@/components/ui/button";
import {
  listActiveCategories,
  listActiveProducts,
  type PublicCategory,
  type PublicProduct,
} from "@/lib/api/public-catalog-service";

const Catalogo = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        listActiveCategories(),
        listActiveProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.short_description ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q);
      const matchCat =
        selectedCategory === "all" || p.category_ids.includes(selectedCategory);
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
          Catálogo de Productos
        </h1>
        <div className="mb-4 h-1 w-16 rounded bg-accent" />
        <p className="text-muted-foreground">
          Explora nuestro inventario de equipos industriales y EPP
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters sidebar */}
        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <ProductFilters
              categories={categories}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              onClearFilters={clearFilters}
            />
          </div>

          {!loading && !error && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{filteredProducts.length}</strong>{" "}
                {filteredProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
              </p>
            </div>
          )}
        </aside>

        {/* Product grid */}
        <main>
          {loading && (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && error && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
              <p className="mb-4 text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={load}>
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
              <PackageOpen className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No se encontraron productos</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Intenta ajustar los filtros o la búsqueda
              </p>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalogo;
