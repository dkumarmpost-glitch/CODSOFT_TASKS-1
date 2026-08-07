import { Product } from "@/data/products";

const BASE_URL = "https://dummyjson.com";

interface DummyJSONProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  rating: number;
}

interface DummyJSONResponse {
  products: DummyJSONProduct[];
  total: number;
  skip: number;
  limit: number;
}

interface DummyJSONCategory {
  slug: string;
  name: string;
  url: string;
}

function mapProduct(p: DummyJSONProduct): Product {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    image: p.thumbnail,
    category: p.category,
    rating: p.rating,
  };
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await request<DummyJSONResponse>(`${BASE_URL}/products`);
  return data.products.map(mapProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const data = await request<DummyJSONResponse>(
    `${BASE_URL}/products/search?q=${encodeURIComponent(query)}`
  );
  return data.products.map(mapProduct);
}

export async function fetchCategories(): Promise<string[]> {
  const data = await request<DummyJSONCategory[]>(`${BASE_URL}/products/categories`);
  return data.map((c) => c.slug);
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  const data = await request<DummyJSONResponse>(
    `${BASE_URL}/products/category/${encodeURIComponent(category)}`
  );
  return data.products.map(mapProduct);
}
