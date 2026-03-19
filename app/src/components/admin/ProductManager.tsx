import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Loader2, Package, PencilLine, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listProducts,
  listCategories,
  createProduct,
  updateProduct,
  toggleProductActive,
  deleteProduct,
  type ProductWithCategory,
} from "@/lib/api/admin-catalog-service";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/supabase";
import ImageGalleryManager, {
  type ImageGalleryManagerHandle,
} from "@/components/admin/ImageGalleryManager";

interface FormState {
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  category_id: "",
  short_description: "",
  description: "",
};

const ProductManager = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductWithCategory | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const galleryRef = useRef<ImageGalleryManagerHandle | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([listProducts(), listCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || (p.short_description ?? "").toLowerCase().includes(q);
      const matchCat = filterCategory === "all" || p.category_id === filterCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, filterCategory]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setSlugManual(false);
    setDialogOpen(true);
  };

  const openEdit = (prod: ProductWithCategory) => {
    setEditTarget(prod);
    setForm({
      name: prod.name,
      slug: prod.slug,
      category_id: prod.category_id,
      short_description: prod.short_description ?? "",
      description: prod.description ?? "",
    });
    setSlugManual(true);
    setDialogOpen(true);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugManual ? prev.slug : slugify(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManual(true);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.category_id) {
      toast.error("Nombre, slug y categoría son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category_id: form.category_id,
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
      };

      if (editTarget) {
        const updated = await updateProduct(editTarget.id, payload);
        const cat = categories.find((c) => c.id === updated.category_id);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === updated.id
              ? { ...updated, category_name: cat?.name ?? "" }
              : p
          )
        );
        if (galleryRef.current?.hasPendingDeletions()) {
          await galleryRef.current.commitPendingDeletions();
          toast.success("Cambios de galería aplicados.");
        }
        toast.success("Producto actualizado.");
      } else {
        const created = await createProduct(payload);
        const cat = categories.find((c) => c.id === created.category_id);
        setProducts((prev) => [
          ...prev,
          { ...created, category_name: cat?.name ?? "" },
        ]);
        toast.success("Producto creado.");
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prod: ProductWithCategory) => {
    try {
      await deleteProduct(prod.id);
      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
      toast.success("Producto eliminado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar.");
    }
  };

  const handleToggle = async (prod: ProductWithCategory) => {
    const next = !prod.is_active;
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_active: next } : p))
    );
    try {
      await toggleProductActive(prod.id, next);
      toast.success(next ? "Producto activado." : "Producto desactivado.");
    } catch (e) {
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, is_active: prod.is_active } : p))
      );
      toast.error(e instanceof Error ? e.message : "Error al cambiar estado.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Productos del Catálogo</CardTitle>
                <CardDescription>
                  Crea, edita y activa/desactiva los productos del catálogo.
                </CardDescription>
              </div>
              <Button size="sm" onClick={openCreate} className="shrink-0">
                <Plus className="mr-1 h-4 w-4" />
                Nuevo
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}{" "}
              <button className="underline" onClick={load}>
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {products.length === 0
                  ? "No hay productos. Crea el primero."
                  : "No hay productos con los filtros aplicados."}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="hidden md:table-cell">Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-[200px]">
                          <div className="truncate">{prod.name}</div>
                          {prod.short_description && (
                            <div className="truncate text-xs text-muted-foreground mt-0.5">
                              {prod.short_description}
                            </div>
                          )}
                          <div className="md:hidden text-xs text-muted-foreground mt-0.5">
                            {prod.category_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{prod.category_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={prod.is_active ? "default" : "secondary"}>
                          {prod.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(prod)}
                            aria-label={`Editar ${prod.name}`}
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggle(prod)}
                            aria-label={
                              prod.is_active ? `Desactivar ${prod.name}` : `Activar ${prod.name}`
                            }
                          >
                            {prod.is_active ? (
                              <PowerOff className="h-4 w-4 text-destructive" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Eliminar ${prod.name}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Eliminar "{prod.name}"?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminarán también
                                  los registros de imágenes asociados (Scenario 5).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(prod)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={editTarget ? "sm:max-w-2xl" : "sm:max-w-lg"}>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Modifica los datos y la galería de imágenes del producto."
                : "Completa los datos para crear un nuevo producto."}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto space-y-4 py-2 pr-1">
            <div className="space-y-1.5">
              <Label htmlFor="prod-name">Nombre *</Label>
              <Input
                id="prod-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Casco de Seguridad MSA"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-slug">Slug *</Label>
              <Input
                id="prod-slug"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="casco-de-seguridad-msa"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Se genera automáticamente. Puedes editarlo manualmente.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-category">Categoría *</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm((prev) => ({ ...prev, category_id: v }))}
              >
                <SelectTrigger id="prod-category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-short-desc">Descripción corta</Label>
              <Input
                id="prod-short-desc"
                value={form.short_description}
                onChange={(e) => setForm((prev) => ({ ...prev, short_description: e.target.value }))}
                placeholder="Breve descripción del producto"
                maxLength={160}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-desc">Descripción completa</Label>
              <Textarea
                id="prod-desc"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción detallada, materiales, usos, normas..."
                rows={3}
              />
            </div>

            {/* Gallery section — only available when editing an existing product */}
            {editTarget && (
              <div className="border-t pt-4">
                <p className="mb-3 text-sm font-medium">Imágenes del producto</p>
                <ImageGalleryManager ref={galleryRef} productId={editTarget.id} />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductManager;
