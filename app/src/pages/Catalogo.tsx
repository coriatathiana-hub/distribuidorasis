import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { Button } from "@/components/ui/button";
import { catalogRepository } from "@/lib/catalog-service";
import { PackageOpen } from "lucide-react";

const Catalogo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = useMemo(() => {
    return catalogRepository.list({ query: searchQuery, category: selectedCategory });
  }, [searchQuery, selectedCategory]);

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
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              onClearFilters={clearFilters}
            />
          </div>
          
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{filteredProducts.length}</strong>{" "}
              {filteredProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
            </p>
          </div>
        </aside>

        {/* Product grid */}
        <main>
          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
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
        </main>
      </div>
    </div>
  );
};

export default Catalogo;
