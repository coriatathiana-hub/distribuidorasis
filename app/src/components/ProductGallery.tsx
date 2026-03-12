import { useEffect, useMemo, useState } from "react";
import { Package } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { PublicProductImage } from "@/lib/api/public-catalog-service";

interface ProductGalleryProps {
  productName: string;
  images?: PublicProductImage[];
}

const ProductGallery = ({ productName, images = [] }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, true>>({});

  const orderedImages = useMemo(
    () => images.slice().sort((a, b) => a.sort_order - b.sort_order),
    [images],
  );

  const initialSelected = useMemo(() => {
    const coverIndex = orderedImages.findIndex((img) => img.is_cover);
    return coverIndex >= 0 ? coverIndex : 0;
  }, [orderedImages]);

  // keep default at cover image when gallery input changes (e.g. route changes)
  useEffect(() => {
    setSelectedImage(initialSelected);
  }, [initialSelected]);

  const hasImages = orderedImages.length > 0;
  const selected = orderedImages[selectedImage];

  const markFailed = (url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
  };

  return (
    <div className="space-y-4">
      {/* Main image / fallback */}
      <AspectRatio ratio={4 / 3} className="bg-muted rounded-lg overflow-hidden border">
        {hasImages && selected && !failedUrls[selected.public_url] ? (
          <img
            src={selected.public_url}
            alt={selected.alt_text ?? `${productName} - Imagen ${selectedImage + 1}`}
            className="h-full w-full object-cover"
            onError={() => markFailed(selected.public_url)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <Package className="mx-auto h-24 w-24 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Imagen no disponible
              </p>
            </div>
          </div>
        )}
      </AspectRatio>

      {/* Mobile-first carousel for public detail */}
      {orderedImages.length > 1 && (
        <div className="px-10 sm:px-12">
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent>
              {orderedImages.map((image, index) => (
                <CarouselItem key={image.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className="w-full"
                    aria-label={`Ver imagen ${index + 1} de ${orderedImages.length}`}
                  >
                    <AspectRatio ratio={4 / 3} className="bg-muted rounded-lg overflow-hidden border">
                      {!failedUrls[image.public_url] ? (
                        <img
                          src={image.public_url}
                          alt={image.alt_text ?? `${productName} - Vista ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={() => markFailed(image.public_url)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </AspectRatio>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious aria-label="Imagen anterior" />
            <CarouselNext aria-label="Imagen siguiente" />
          </Carousel>
        </div>
      )}

      {/* Thumbnail strip for quick jump */}
      {orderedImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {orderedImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={[
                "touch-target relative rounded-md border-2 transition-colors overflow-hidden",
                selectedImage === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50",
              ].join(" ")}
              aria-label={`Miniatura ${index + 1} de ${orderedImages.length}`}
            >
              <AspectRatio ratio={1} className="bg-muted">
                {!failedUrls[image.public_url] ? (
                  <img
                    src={image.public_url}
                    alt={image.alt_text ?? `${productName} - Vista ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={() => markFailed(image.public_url)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
