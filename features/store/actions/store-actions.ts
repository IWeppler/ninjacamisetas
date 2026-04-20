"use server";

import { createClient } from "@/shared/config/supabase/server";
import { cookies } from "next/headers";
import { Camiseta } from "@/entities/camisetas/types";

// 1. Acción para obtener todo el catálogo (Vista de grilla)
export async function getPublicCatalogAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Solo traemos camisetas publicadas.
  // IMPORTANTE: También traemos el stock para calcular si está "Agotado"
  const { data, error } = await supabase
    .from("camisetas")
    .select(
      `
      *,
      stock:camisetas_stock(
        id,
        talle,
        cantidad
      )
    `,
    )
    .eq("publicado", true)
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("Error fetching public catalog:", error);
    return { data: null, error: "No se pudo cargar el catálogo." };
  }

  return { data: data as Camiseta[], error: null };
}

// 2. NUEVA ACCIÓN: Obtener una sola camiseta usando su URL amigable (slug)
export async function getCamisetaBySlugAction(slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("camisetas")
    .select(
      `
      *,
      stock:camisetas_stock(
        id,
        talle,
        cantidad
      )
    `,
    )
    .eq("slug", slug)
    .eq("publicado", true)
    .single();

  if (error) {
    console.error(`Error fetching camiseta by slug (${slug}):`, error);
    return { data: null, error: "No se encontró la camiseta solicitada." };
  }

  return { data: data as Camiseta, error: null };
}
