import {
  PRODUCTS,
  getProductsByCategory,
  searchProducts,
  type Product,
} from "@/data/products";

export interface CatalogFilters {
  query?: string;
  category?: string;
}

export interface CatalogRepository {
  list(filters?: CatalogFilters): Product[];
}

class MockCatalogRepository implements CatalogRepository {
  list(filters: CatalogFilters = {}): Product[] {
    const query = filters.query?.trim() ?? "";
    const category = filters.category ?? "all";

    let products = category === "all" ? PRODUCTS : getProductsByCategory(category);
    if (!query) return products;

    const searchResults = searchProducts(query);
    return products.filter((product) => searchResults.some((result) => result.id === product.id));
  }
}

export const catalogRepository: CatalogRepository = new MockCatalogRepository();
