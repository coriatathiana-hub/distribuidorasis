import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
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

  const goPrev = () => {
    if (!orderedImages.length) return;
    setSelectedImage((prev) => (prev - 1 + orderedImages.length) % orderedImages.length);
  };

  const goNext = () => {
    if (!orderedImages.length) return;
    setSelectedImage((prev) => (prev + 1) % orderedImages.length);
  };

  const markFailed = (url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
  };

  return (
    <div className="space-y-3">
      <div className="group relative">
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

        {orderedImages.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-black/35 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/55 hover:text-white md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
              onClick={goPrev}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-black/35 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/55 hover:text-white md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
              onClick={goNext}
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm">
              {orderedImages.map((_, idx) => (
                <span
                  key={`dot-${idx}`}
                  className={[
                    "h-1.5 w-1.5 rounded-full transition",
                    idx === selectedImage ? "bg-white" : "bg-white/45",
                  ].join(" ")}
                  aria-hidden="true"
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip for quick jump */}
      {orderedImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {orderedImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={[
                "touch-target relative overflow-hidden rounded-md border transition-all",
                selectedImage === index
                  ? "border-primary ring-1 ring-primary/40"
                  : "border-transparent opacity-80 hover:opacity-100 hover:border-muted-foreground/40",
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
