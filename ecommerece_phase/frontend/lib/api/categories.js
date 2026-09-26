import api from "@/lib/axios";
import { serverFetch } from "./server-fetch";

export async function getCategoriesSSR(tree = false) {
  return serverFetch(`/categories${tree ? "?tree=true" : ""}`, { revalidate: 300 });
}

export async function getCategoryBySlugSSR(slug) {
  return serverFetch(`/categories/${slug}`, { revalidate: 300 });
}

export async function getCategories(tree = false) {
  const { data } = await api.get("/categories", { params: tree ? { tree: true } : {} });
  return data;
}
