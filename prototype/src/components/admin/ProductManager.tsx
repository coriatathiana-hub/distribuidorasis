import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { Package } from "lucide-react";

const ProductManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filterCategory]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle>Productos del Catálogo</CardTitle>
            <CardDescription>
              Vista de solo lectura de los productos publicados en el catálogo
            </CardDescription>
          </div>

          {/* Search and Filters */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(CATEGORIES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No se encontraron productos con los filtros aplicados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="hidden md:table-cell">Categoría</TableHead>
                  <TableHead className="hidden sm:table-cell">Subcategoría</TableHead>
                  <TableHead className="hidden lg:table-cell">Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="truncate">{product.name}</div>
                      <div className="md:hidden text-xs text-muted-foreground mt-1">
                        {CATEGORIES[product.category as keyof typeof CATEGORIES]}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">
                        {CATEGORIES[product.category as keyof typeof CATEGORIES]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {product.subcategory}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-xs">
                      <div className="truncate text-sm text-muted-foreground">
                        {product.description}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductManager;
