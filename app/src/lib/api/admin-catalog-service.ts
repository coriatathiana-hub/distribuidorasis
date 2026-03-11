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
