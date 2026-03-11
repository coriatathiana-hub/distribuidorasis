import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, PRODUCTS } from "@/data/products";

const CategoryManager = () => {
  // Convert CATEGORIES object to array with product counts
  const categories = useMemo(() => {
    return Object.entries(CATEGORIES).map(([key, name]) => ({
      id: key,
      name: name,
      description: `Categoría de ${name.toLowerCase()}`,
      productCount: PRODUCTS.filter(p => p.category === key).length,
    }));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías del Catálogo</CardTitle>
        <CardDescription>
          Vista de solo lectura de las categorías publicadas en el catálogo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Descripción</TableHead>
                <TableHead className="text-right">Productos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate text-muted-foreground">
                    {category.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{category.productCount}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
