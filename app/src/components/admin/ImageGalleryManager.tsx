import { useState } from "react";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface ImageGalleryManagerProps {
  images: string[];
  onUpdateImages: (images: string[]) => void;
}

const ImageGalleryManager = ({ images, onUpdateImages }: ImageGalleryManagerProps) => {
  const [newImageAlt, setNewImageAlt] = useState("");

  const handleAddImage = () => {
    if (!newImageAlt.trim()) {
      toast({
        title: "Error",
        description: "Ingresa una descripción para la imagen",
        variant: "destructive",
      });
      return;
    }

    // Simulate image URL - in production this would be a file upload
    const newImageUrl = `/placeholder.svg?text=${encodeURIComponent(newImageAlt)}&width=800&height=600`;
    
    onUpdateImages([...images, newImageUrl]);
    setNewImageAlt("");
    
    toast({
      title: "Imagen agregada",
      description: "La imagen se ha agregado correctamente",
    });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onUpdateImages(updatedImages);
    
    toast({
      title: "Imagen eliminada",
      description: "La imagen se ha eliminado correctamente",
    });
  };

  return (
    <div className="space-y-4">
      {/* Add Image Form */}
      <Card className="border-dashed">
        <div className="p-4">
          <Label htmlFor="imageAlt" className="mb-2 block">
            Agregar Nueva Imagen
          </Label>
          <div className="flex gap-2">
            <Input
              id="imageAlt"
              placeholder="Descripción de la imagen (ej: Vista frontal del producto)"
              value={newImageAlt}
              onChange={(e) => setNewImageAlt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
              maxLength={200}
            />
            <Button type="button" onClick={handleAddImage} className="gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Nota: En esta versión las imágenes son placeholders. En producción aquí subirías archivos reales.
          </p>
        </div>
      </Card>

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
          <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay imágenes agregadas aún
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((imageUrl, index) => (
            <Card key={index} className="group relative overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={imageUrl}
                  alt={`Imagen ${index + 1} del producto`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveImage(index)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2 text-xs text-white">
                Imagen {index + 1} de {images.length}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGalleryManager;
