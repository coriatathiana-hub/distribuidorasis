/**
 * ImageGalleryManager — HU-3.2
 * Admin UI for uploading, reordering, setting cover, and deleting product images.
 * Self-contained: loads and manages its own images state via admin-catalog-service DAL.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ImageIcon,
  Loader2,
  Save,
  Star,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  batchUpdateSortOrder,
  deleteProductImage,
  listProductImages,
  setProductImageCover,
  uploadProductImage,
} from "@/lib/api/admin-catalog-service";
import type { ProductImage } from "@/types/supabase";

// ── File validation constants ─────────────────────────────────────────────────
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface FileStatus {
  name: string;
  state: "uploading" | "success" | "error";
  message?: string;
}

interface Props {
  productId: string;
}

const ImageGalleryManager = ({ productId }: Props) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load ─────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProductImages(productId);
      setImages(data);
    } catch {
      toast.error("Error al cargar la galería.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── File validation ───────────────────────────────────────────────────────────
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_MIME.includes(file.type)) {
      const ext = file.name.split(".").pop()?.toUpperCase() ?? file.type;
      return `Tipo no permitido (${ext}). Solo JPG, PNG o WEBP.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Demasiado grande: ${(file.size / 1024 / 1024).toFixed(1)} MB (máx. ${MAX_SIZE_MB} MB).`;
    }
    return null;
  };

  // ── Upload handler (async portion — only called for valid files) ──────────────
  const uploadValidFiles = async (
    entries: { file: File; idx: number }[],
    statuses: FileStatus[],
    nextOrder: number,
  ) => {
    const updated = [...statuses];
    let order = nextOrder;
    const newImages: ProductImage[] = [];

    for (const { file, idx } of entries) {
      try {
        const img = await uploadProductImage(productId, file, order);
        newImages.push(img);
        order++;
        updated[idx] = { name: file.name, state: "success" };
      } catch (e) {
        updated[idx] = {
          name: file.name,
          state: "error",
          message: e instanceof Error ? e.message : "Error al subir.",
        };
      }
      setFileStatuses([...updated]);
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      setOrderDirty(false);
    }

    setTimeout(() => setFileStatuses([]), 5000);
  };

  /**
   * Validation runs synchronously (inside React's act() context) so that
   * validation errors appear immediately in the DOM.
   * Upload of valid files is then delegated to the async uploadValidFiles().
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    e.target.value = "";

    // Synchronous validation: determine initial status for every file at once
    const initialStatuses: FileStatus[] = files.map((file) => {
      const err = validateFile(file);
      return err
        ? { name: file.name, state: "error", message: err }
        : { name: file.name, state: "uploading" };
    });
    setFileStatuses(initialStatuses); // synchronous — captured by act() in tests

    const validEntries = files
      .map((file, idx) => ({ file, idx }))
      .filter(({ idx }) => initialStatuses[idx].state === "uploading");

    if (validEntries.length > 0) {
      void uploadValidFiles(validEntries, initialStatuses, images.length);
    } else {
      // All files were invalid — clear status bar after a delay
      setTimeout(() => setFileStatuses([]), 5000);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (img: ProductImage) => {
    try {
      await deleteProductImage(img.id, img.storage_path);
      const remaining = images.filter((i) => i.id !== img.id);
      // Re-normalize sort_orders in DB to close the gap; ensures nextOrder stays valid
      if (remaining.length > 0) {
        await batchUpdateSortOrder(
          productId,
          remaining.map((i) => i.id),
        );
      }
      await load();
      setOrderDirty(false);
      toast.success("Imagen eliminada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar.");
    }
  };

  // ── Set cover ─────────────────────────────────────────────────────────────────
  const handleSetCover = async (img: ProductImage) => {
    try {
      await setProductImageCover(productId, img.id);
      setImages((prev) => prev.map((i) => ({ ...i, is_cover: i.id === img.id })));
      toast.success("Portada actualizada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al marcar portada.");
    }
  };

  // ── Reorder ───────────────────────────────────────────────────────────────────
  const moveImage = (index: number, dir: "up" | "down") => {
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((i, idx) => ({ ...i, sort_order: idx }));
    });
    setOrderDirty(true);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      await batchUpdateSortOrder(
        productId,
        images.map((i) => i.id),
      );
      await load();
      setOrderDirty(false);
      toast.success("Orden guardado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar orden.");
    } finally {
      setSavingOrder(false);
    }
  };

  const isUploading = fileStatuses.some((s) => s.state === "uploading");
  const busy = loading || savingOrder || isUploading;

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div className="rounded-lg border-2 border-dashed p-4 text-center">
        <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="mb-3 text-xs text-muted-foreground">
          JPG, PNG o WEBP · máx. {MAX_SIZE_MB} MB por archivo
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Seleccionar imágenes
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
          data-testid="file-input"
        />
      </div>

      {/* Per-file upload statuses */}
      {fileStatuses.length > 0 && (
        <ul className="space-y-1.5" aria-label="Estado de carga">
          {fileStatuses.map((s, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              {s.state === "uploading" && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              )}
              {s.state === "success" && (
                <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
              )}
              {s.state === "error" && (
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
              <span className="flex-1 truncate">{s.name}</span>
              {s.message && (
                <span className="ml-2 text-xs text-destructive">{s.message}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border py-10 text-sm text-muted-foreground">
          No hay imágenes. Sube la primera.
        </div>
      )}

      {/* Gallery grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          {orderDirty && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={savingOrder}
              onClick={handleSaveOrder}
              className="gap-2"
              aria-label="Guardar orden"
            >
              {savingOrder ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar orden
            </Button>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {images.map((img, idx) => (
              <Card key={img.id} className="overflow-hidden" role="listitem">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={img.public_url}
                    alt={img.alt_text ?? `Imagen ${idx + 1} del producto`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "";
                    }}
                  />
                  {img.is_cover && (
                    <Badge className="absolute left-2 top-2 gap-1 text-xs">
                      <Star className="h-3 w-3" />
                      Portada
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 p-2">
                  {/* Position controls */}
                  <div className="flex gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, "up")}
                      aria-label={`Mover imagen ${idx + 1} arriba`}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, "down")}
                      aria-label={`Mover imagen ${idx + 1} abajo`}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Action controls */}
                  <div className="flex gap-0.5">
                    {!img.is_cover && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleSetCover(img)}
                        aria-label={`Marcar imagen ${idx + 1} como portada`}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(img)}
                      aria-label={`Eliminar imagen ${idx + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryManager;
