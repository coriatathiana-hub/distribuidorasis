/**
 * Supabase Database type contract — matches schema defined in
 * supabase/migrations/001_initial_catalog_schema.sql
 *
 * Update this file whenever a new migration changes the schema.
 * In a production setup, replace with generated types via:
 *   npx supabase gen types typescript --project-id <ref> > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: "admin";
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: "admin";
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin";
          is_active?: boolean;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
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
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          specs_json?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          specs_json?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          alt_text: string | null;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          public_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
      };
      contact_requests: {
        Row: {
          id: string;
          full_name: string;
          company: string | null;
          phone: string;
          email: string;
          request_type: string;
          message: string;
          source: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          company?: string | null;
          phone: string;
          email: string;
          request_type: string;
          message: string;
          source?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          company?: string | null;
          phone?: string;
          email?: string;
          request_type?: string;
          message?: string;
          source?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
}

/** Convenience row types */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type ContactRequest = Database["public"]["Tables"]["contact_requests"]["Row"];

/** Insert types */
export type InsertCategory = Database["public"]["Tables"]["categories"]["Insert"];
export type InsertProduct = Database["public"]["Tables"]["products"]["Insert"];
export type InsertProductImage = Database["public"]["Tables"]["product_images"]["Insert"];
export type InsertContactRequest = Database["public"]["Tables"]["contact_requests"]["Insert"];

/** Update types */
export type UpdateCategory = Database["public"]["Tables"]["categories"]["Update"];
export type UpdateProduct = Database["public"]["Tables"]["products"]["Update"];
export type UpdateProductImage = Database["public"]["Tables"]["product_images"]["Update"];
