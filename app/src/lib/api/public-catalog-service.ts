/**
 * Public Catalog Service — read-only DAL for the public-facing catalog.
 * All queries filter is_active = true; RLS enforces the same constraint for anon users.
 */
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/types/supabase";

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  category_name: string;
  short_description: string | null;
  description: string | null;
  specs_json: Json;
  cover_image_url: string | null;
}

type RawProductRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  specs_json: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories: { name: string } | null;
  product_images: { public_url: string; is_cover: boolean; sort_order: number }[] | null;
};

function mapProduct(row: RawProductRow): PublicProduct {
  const images = (row.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const cover = images.find((img) => img.is_cover) ?? images[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category_id: row.category_id,
    category_name: row.categories?.name ?? "",
    short_description: row.short_description,
    description: row.description,
    specs_json: row.specs_json,
    cover_image_url: cover?.public_url ?? null,
  };
}

export async function listActiveCategories(): Promise<PublicCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listActiveProducts(): Promise<PublicProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), product_images(public_url, is_cover, sort_order)")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as unknown as RawProductRow[] | null ?? []).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), product_images(public_url, is_cover, sort_order)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProduct(data as unknown as RawProductRow);
}
