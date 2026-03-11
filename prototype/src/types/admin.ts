export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ImageItem {
  id: string;
  url: string;
  alt: string;
}
