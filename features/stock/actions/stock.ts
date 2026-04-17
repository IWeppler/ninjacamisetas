"use server";

import { createClient } from "@/shared/config/supabase/server";
import { cookies } from "next/headers";
import { Camiseta } from "@/entities/camisetas/types";

export async function getCamisetasAction(): Promise<{
  data: Camiseta[] | null;
  error: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Hacemos un JOIN con la tabla camisetas_stock
    const { data, error } = await supabase
      .from("camisetas")
      .select(
        `
        *,
        stock:camisetas_stock(id, talle, cantidad)
      `,
      )
      .order("creado_en", { ascending: false });

    if (error) {
      console.error("Error fetching camisetas:", error);
      return { data: null, error: "No se pudo cargar el inventario." };
    }

    return { data: data as Camiseta[], error: null };
  } catch (err) {
    console.error("Unexpected error in getCamisetasAction:", err);
    return {
      data: null,
      error: "Ocurrió un error inesperado al obtener los datos.",
    };
  }
}
