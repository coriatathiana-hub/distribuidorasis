import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { PublicProduct } from "@/lib/api/public-catalog-service";

interface ProductCardProps {
  product: PublicProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [failedUrls, setFailedUrls] = useState<Record<string, true>>({});

  const cardImages = useMemo(() => {
    if (!product.images?.length) return [];
    const sorted = product.images.slice().sort((a, b) => a.sort_order - b.sort_order);
    const cover = sorted.find((img) => img.is_cover);
    if (!cover) return sorted;
    return [cover, ...sorted.filter((img) => img.id !== cover.id)];
  }, [product.images]);

  const markFailed = (url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
  };

  return (
    <Link to={`/producto/${product.slug}`} className="block touch-target">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 overflow-hidden">
        <div className="aspect-square w-full overflow-hidden bg-muted">
          {cardImages.length > 1 ? (
            <Carousel opts={{ align: "start", loop: false }} className="h-full w-full">
              <CarouselContent className="ml-0 h-full">
                {cardImages.map((img, idx) => (
                  <CarouselItem key={img.id} className="pl-0 h-full">
                    {!failedUrls[img.public_url] ? (
                      <img
                        src={img.public_url}
                        alt={img.alt_text ?? `${product.name} - Imagen ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                        onError={() => markFailed(img.public_url)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : product.cover_image_url && !failedUrls[product.cover_image_url] ? (
            <img
              src={product.cover_image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
              onError={() => markFailed(product.cover_image_url!)}
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
              {product.category_name}
            </Badge>
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
