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

/** A single image in a product gallery, ordered by sort_order ascending. */
export interface PublicProductImage {
  id: string;
  public_url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
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
  /** Full ordered gallery. Empty array when no images are configured. */
  images: PublicProductImage[];
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
  product_images: {
    id: string;
    public_url: string;
    alt_text: string | null;
    is_cover: boolean;
    sort_order: number;
  }[] | null;
};

function mapProduct(row: RawProductRow): PublicProduct {
  const images: PublicProductImage[] = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
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
    images,
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

const PRODUCT_IMAGES_SELECT = "id, public_url, alt_text, is_cover, sort_order";

export async function listActiveProducts(): Promise<PublicProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`*, categories(name), product_images(${PRODUCT_IMAGES_SELECT})`)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as unknown as RawProductRow[] | null ?? []).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`*, categories(name), product_images(${PRODUCT_IMAGES_SELECT})`)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProduct(data as unknown as RawProductRow);
}
