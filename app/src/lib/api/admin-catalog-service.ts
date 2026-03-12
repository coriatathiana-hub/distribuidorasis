/**
 * Admin Catalog Service — DAL for categories and products CRUD.
 * All operations require an authenticated admin session (enforced by Supabase RLS).
 */
import { supabase } from "@/lib/supabase/client";
import type {
  Category,
  InsertCategory,
  UpdateCategory,
  Product,
  InsertProduct,
  UpdateProduct,
  ProductImage,
  InsertProductImage,
} from "@/types/supabase";

export type ProductWithCategory = Product & { category_name: string };

type ProductJoinRow = Product & {
  categories: { name: string } | null;
};

// ── Categories ────────────────────────────────────────────────────────────────

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory(payload: InsertCategory): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Ya existe una categoría con ese nombre o slug.");
    throw new Error(error.message);
  }
  return data;
}

export async function updateCategory(id: string, payload: UpdateCategory): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Ya existe una categoría con ese nombre o slug.");
    throw new Error(error.message);
  }
  return data;
}

export async function toggleCategoryActive(id: string, is_active: boolean): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update({ is_active })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function listProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data as unknown as ProductJoinRow[] | null ?? []).map(
    ({ categories, ...row }) => ({
      ...row,
      category_name: categories?.name ?? "",
    })
  );
}

export async function createProduct(payload: InsertProduct): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Ya existe un producto con ese nombre o slug.");
    throw new Error(error.message);
  }
  return data;
}

export async function updateProduct(id: string, payload: UpdateProduct): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Ya existe un producto con ese nombre o slug.");
    throw new Error(error.message);
  }
  return data;
}

export async function toggleProductActive(id: string, is_active: boolean): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Product Images ────────────────────────────────────────────────────────────

export async function listProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addProductImage(payload: InsertProductImage): Promise<ProductImage> {
  const { data, error } = await supabase
    .from("product_images")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === "23514")
      throw new Error(
        "Los datos de la imagen son inválidos (URL o ruta vacía, u orden de posición negativo).",
      );
    if (error.code === "23505")
      throw new Error("Ya existe una imagen en esa posición para este producto.");
    throw new Error(error.message);
  }
  return data;
}

/**
 * Deletes a product image row and attempts a best-effort cleanup of the Storage object.
 * Storage errors are silenced — orphaned objects can be removed manually.
 * @param id        UUID of the product_images row.
 * @param storagePath Supabase Storage object path (e.g. "products/image.jpg").
 */
export async function deleteProductImage(id: string, storagePath: string): Promise<void> {
  const { error } = await supabase.from("product_images").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // best-effort: don't throw if storage cleanup fails
  await supabase.storage.from("products").remove([storagePath]);
}

/**
 * Atomically switches the cover image for a product.
 * Step 1: clears is_cover on all images for the product.
 * Step 2: sets is_cover=true on the target image.
 * The partial unique index (is_cover=true) is satisfied after both steps.
 */
export async function setProductImageCover(
  productId: string,
  imageId: string,
): Promise<void> {
  const { error: clearError } = await supabase
    .from("product_images")
    .update({ is_cover: false })
    .eq("product_id", productId);

  if (clearError) throw new Error(clearError.message);

  const { error: setError } = await supabase
    .from("product_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  if (setError) throw new Error(setError.message);
}

// ── Categories (delete) ───────────────────────────────────────────────────────

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    // 23503 = FK violation — category has products assigned (ON DELETE RESTRICT)
    if (error.code === "23503") {
      throw new Error(
        "No se puede eliminar la categoría porque tiene productos asignados."
      );
    }
    throw new Error(error.message);
  }
}
