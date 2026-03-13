#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    apply: args.has("--apply"),
    verbose: args.has("--verbose"),
    strict: args.has("--strict"),
  };
}

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function bySlugAndExtension(files) {
  const index = new Map();
  for (const fileName of files) {
    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) continue;
    const slug = path.basename(fileName, ext).toLowerCase();
    if (!index.has(slug)) index.set(slug, []);
    index.get(slug).push(fileName);
  }
  return index;
}

function resolveFileForSlug(filesIndex, slug) {
  const candidates = filesIndex.get(slug) ?? [];
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Prefer deterministic extension order to keep migration idempotent.
  for (const ext of ALLOWED_EXTENSIONS) {
    const preferred = `${slug}${ext}`;
    if (candidates.includes(preferred)) return preferred;
  }
  return candidates[0];
}

async function listLocalProductFiles(productsDir) {
  const entries = await readdir(productsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

function logVerbose(enabled, message) {
  if (enabled) console.log(message);
}

async function main() {
  const { apply, verbose, strict } = parseArgs(process.argv);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const appRoot = path.resolve(__dirname, "..");
  const productsDir = process.env.PRODUCTS_DIR
    ? path.resolve(process.env.PRODUCTS_DIR)
    : path.join(appRoot, "public", "products");

  const supabaseUrl = requireEnv(
    "SUPABASE_URL or VITE_SUPABASE_URL",
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
  );
  const serviceRoleKey = requireEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const bucket = process.env.SUPABASE_PRODUCTS_BUCKET ?? "products";
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const [localFiles, productsResult, imagesResult] = await Promise.all([
    listLocalProductFiles(productsDir),
    supabase.from("products").select("id, slug").order("slug", { ascending: true }),
    supabase
      .from("product_images")
      .select("id, product_id, storage_path, sort_order, is_cover")
      .order("sort_order", { ascending: true }),
  ]);

  if (productsResult.error) throw new Error(productsResult.error.message);
  if (imagesResult.error) throw new Error(imagesResult.error.message);

  const products = productsResult.data ?? [];
  const images = imagesResult.data ?? [];
  const filesIndex = bySlugAndExtension(localFiles);
  const imagesByProductId = new Map();

  for (const image of images) {
    if (!imagesByProductId.has(image.product_id)) imagesByProductId.set(image.product_id, []);
    imagesByProductId.get(image.product_id).push(image);
  }

  let uploaded = 0;
  let inserted = 0;
  let skippedExisting = 0;
  let missingLocal = 0;
  let failures = 0;

  console.log(
    `[migrate-product-images] mode=${apply ? "apply" : "dry-run"} products=${products.length} local_files=${localFiles.length} bucket=${bucket}`,
  );

  for (const product of products) {
    const fileName = resolveFileForSlug(filesIndex, product.slug);
    if (!fileName) {
      missingLocal += 1;
      logVerbose(verbose, `- missing local file for slug=${product.slug}`);
      continue;
    }

    const ext = path.extname(fileName).toLowerCase();
    const storagePath = `products/${product.id}/${product.slug}${ext}`;
    const localPath = path.join(productsDir, fileName);
    const existing = imagesByProductId.get(product.id) ?? [];
    const alreadyExists = existing.some((row) => row.storage_path === storagePath);

    if (alreadyExists) {
      skippedExisting += 1;
      logVerbose(verbose, `- skip existing storage_path=${storagePath}`);
      continue;
    }

    const nextSortOrder =
      existing.length === 0 ? 0 : Math.max(...existing.map((row) => row.sort_order)) + 1;
    const hasCover = existing.some((row) => row.is_cover === true);
    const isCover = !hasCover;

    if (!apply) {
      logVerbose(
        true,
        `- DRYRUN slug=${product.slug} file=${fileName} -> ${storagePath} sort=${nextSortOrder} cover=${isCover}`,
      );
      continue;
    }

    try {
      const buffer = await readFile(localPath);
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: undefined,
          upsert: true,
        });

      if (uploadError) throw new Error(uploadError.message);
      uploaded += 1;

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      const { data: insertedRow, error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: product.id,
          storage_path: storagePath,
          public_url: publicUrlData.publicUrl,
          sort_order: nextSortOrder,
          is_cover: isCover,
        })
        .select("id, product_id, storage_path, sort_order, is_cover")
        .single();

      if (insertError || !insertedRow) {
        await supabase.storage.from(bucket).remove([storagePath]);
        throw new Error(insertError?.message ?? "insert failed without error message");
      }

      inserted += 1;
      existing.push(insertedRow);
      imagesByProductId.set(product.id, existing);

      logVerbose(
        verbose,
        `- inserted slug=${product.slug} storage_path=${storagePath} sort=${nextSortOrder} cover=${isCover}`,
      );
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`- failed slug=${product.slug}: ${message}`);
      if (strict) break;
    }
  }

  console.log("[migrate-product-images] summary");
  console.log(`  uploaded=${uploaded}`);
  console.log(`  inserted_rows=${inserted}`);
  console.log(`  skipped_existing=${skippedExisting}`);
  console.log(`  missing_local_files=${missingLocal}`);
  console.log(`  failures=${failures}`);

  if (failures > 0 && strict) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    `[migrate-product-images] fatal: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
