import { useEffect, useState, useCallback } from "react";
import { Loader2, PencilLine, Plus, PowerOff, Power } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listCategories,
  createCategory,
  updateCategory,
  toggleCategoryActive,
} from "@/lib/api/admin-catalog-service";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/supabase";

interface FormState {
  name: string;
  slug: string;
  sort_order: string;
}

const EMPTY_FORM: FormState = { name: "", slug: "", sort_order: "" };

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar categorías.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setSlugManual(false);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      sort_order: cat.sort_order.toString(),
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
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Nombre y slug son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sort_order: form.sort_order ? Number(form.sort_order) : 0,
      };

      if (editTarget) {
        const updated = await updateCategory(editTarget.id, payload);
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast.success("Categoría actualizada.");
      } else {
        const created = await createCategory(payload);
        setCategories((prev) => [...prev, created]);
        toast.success("Categoría creada.");
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (cat: Category) => {
    const next = !cat.is_active;
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, is_active: next } : c))
    );
    try {
      await toggleCategoryActive(cat.id, next);
      toast.success(next ? "Categoría activada." : "Categoría desactivada.");
    } catch (e) {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: cat.is_active } : c))
      );
      toast.error(e instanceof Error ? e.message : "Error al cambiar estado.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Categorías del Catálogo</CardTitle>
              <CardDescription>
                Crea, edita y activa/desactiva las categorías del catálogo.
              </CardDescription>
            </div>
            <Button size="sm" onClick={openCreate} className="shrink-0">
              <Plus className="mr-1 h-4 w-4" />
              Nueva
            </Button>
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

          {!loading && !error && categories.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No hay categorías. Crea la primera.
            </p>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Slug</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Orden</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                        {cat.slug}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                        {cat.sort_order}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cat.is_active ? "default" : "secondary"}>
                          {cat.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(cat)}
                            aria-label={`Editar ${cat.name}`}
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggle(cat)}
                            aria-label={
                              cat.is_active ? `Desactivar ${cat.name}` : `Activar ${cat.name}`
                            }
                          >
                            {cat.is_active ? (
                              <PowerOff className="h-4 w-4 text-destructive" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Modifica los datos de la categoría."
                : "Completa los datos para crear una nueva categoría."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Nombre *</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Equipo de Protección Personal"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="equipo-de-proteccion-personal"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Se genera automáticamente. Puedes editarlo manualmente.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Orden de presentación</Label>
              <Input
                id="cat-order"
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryManager;
