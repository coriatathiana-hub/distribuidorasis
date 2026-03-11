import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/data/products";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
}

const ProductFilters = ({
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
}: ProductFiltersProps) => {
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== "all";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search" className="text-base">
          Buscar producto
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="search"
            placeholder="Nombre, descripción..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 touch-target"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-base">
          Categoría
        </Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger id="category" className="touch-target">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button type="button" variant="outline" className="w-full touch-target" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
};

export default ProductFilters;
