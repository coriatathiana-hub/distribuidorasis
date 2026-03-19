import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicProduct } from "@/lib/api/public-catalog-service";

interface ProductCardProps {
  product: PublicProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [failedUrls, setFailedUrls] = useState<Record<string, true>>({});

  const primaryImageUrl = useMemo(() => {
    if (!product.images?.length) return product.cover_image_url;
    const sorted = product.images.slice().sort((a, b) => a.sort_order - b.sort_order);
    const cover = sorted.find((img) => img.is_cover);
    return (cover ?? sorted[0])?.public_url ?? product.cover_image_url;
  }, [product.images, product.cover_image_url]);

  const markFailed = (url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
  };

  return (
    <Link to={`/producto/${product.slug}`} className="block touch-target">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 overflow-hidden">
        <div className="aspect-square w-full overflow-hidden bg-muted">
          {primaryImageUrl && !failedUrls[primaryImageUrl] ? (
            <img
              src={primaryImageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
              onError={() => markFailed(primaryImageUrl)}
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
            {(product.category_names.length > 0
              ? product.category_names
              : [product.category_name]
            ).map((categoryName) => (
              <Badge key={`${product.id}-${categoryName}`} variant="secondary" className="text-xs">
                {categoryName}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {product.short_description ?? product.description ?? ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
