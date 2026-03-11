import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/producto/${product.id}`} className="block touch-target">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 overflow-hidden">
        <div className="aspect-square w-full overflow-hidden bg-muted">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardHeader className="space-y-2 pb-2 pt-3">
          <CardTitle className="line-clamp-2 text-lg leading-tight">{product.name}</CardTitle>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {product.subcategory}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {product.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
