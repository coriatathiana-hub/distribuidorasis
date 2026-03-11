import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface ProductGalleryProps {
  productName: string;
  imageUrl?: string;
  imageCount?: number;
}

const ProductGallery = ({ productName, imageUrl, imageCount = 1 }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Use real image if available, otherwise show placeholder
  const images = imageUrl
    ? [{ id: 0, url: imageUrl, alt: productName }]
    : Array.from({ length: imageCount }, (_, i) => ({
        id: i,
        alt: `${productName} - Vista ${i + 1}`,
      }));

  return (
    <div className="space-y-4">
      {/* Main image */}
      <AspectRatio ratio={4 / 3} className="bg-muted rounded-lg overflow-hidden border">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="h-full w-full object-cover"
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

      {/* Thumbnail gallery - only show if multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "touch-target relative rounded-md border-2 transition-colors overflow-hidden",
                selectedImage === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
              aria-label={image.alt}
            >
              <AspectRatio ratio={1} className="bg-muted">
                {'url' in image && image.url ? (
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="h-full w-full object-cover"
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
