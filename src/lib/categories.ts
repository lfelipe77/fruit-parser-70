import { supabase } from "@/integrations/supabase/client";
import type { CategoryPublic } from "@/types/category";

// Fetch featured categories via the public view. Anon-accessible.
export async function fetchFeaturedCategories(): Promise<CategoryPublic[]> {
  const { data, error } = await (supabase as any)
    .from("ganhavel_categories_public")
    .select("*");

  if (error) {
    console.error("Failed to load categories from public view:", error.message);
    return [];
  }

  const rows = Array.isArray(data) ? (data as CategoryPublic[]) : [];

  // dev-only sanity guard
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    for (const row of rows) {
      if (row?.destaque !== true) {
        console.warn("[cats] non-featured row detected unexpectedly", row);
        break;
      }
    }
  }

  return rows;
}

export type { CategoryPublic };
