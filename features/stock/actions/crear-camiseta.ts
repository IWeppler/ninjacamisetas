"use server";

import { createClient } from "@/shared/config/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function crearCamisetaAction(
  prevState: { error: string | null; success: boolean },
  formData: FormData,
) {
  const equipo = formData.get("equipo") as string;
  const temporada = formData.get("temporada") as string;
  const tipo = formData.get("tipo") as string;
  const precio = Number.parseFloat(formData.get("precio") as string);
  const precio_costo = Number.parseFloat(
    formData.get("precio_costo") as string,
  );

  const archivos = formData.getAll("imagenes") as File[];

  if (
    !equipo ||
    !temporada ||
    !tipo ||
    Number.isNaN(precio) ||
    Number.isNaN(precio_costo)
  ) {
    return {
      error: "Por favor completa todos los campos obligatorios.",
      success: false,
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let imagen_url = null;

  // 1. Subimos las imágenes a Supabase Storage
  const validFiles = archivos.filter((f) => f.size > 0);
  if (validFiles.length > 0) {
    const urls = [];
    for (const file of validFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("camisetas")
        .upload(fileName, file);

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("camisetas").getPublicUrl(fileName);
        urls.push(publicUrl);
      } else {
        console.error("Error subiendo archivo:", uploadError);
      }
    }

    // Guardamos el array de URLs como un JSON string para soportar múltiples fotos
    if (urls.length > 0) {
      imagen_url = JSON.stringify(urls);
    }
  }

  // 2. Insertamos la camiseta en la tabla principal
  const { data: nuevaCamiseta, error: errorCamiseta } = await supabase
    .from("camisetas")
    .insert({
      equipo,
      temporada,
      tipo,
      precio,
      precio_costo,
      imagen_url,
    })
    .select("id")
    .single();

  if (errorCamiseta || !nuevaCamiseta) {
    console.error(errorCamiseta);
    return {
      error: "Hubo un error al crear la camiseta base.",
      success: false,
    };
  }

  // 3. Preparamos el stock por talle
  const tallesPosibles = ["S", "M", "L", "XL", "XXL"];
  const stockParaInsertar = tallesPosibles
    .map((talle) => {
      const cantidadStr = formData.get(`stock_${talle}`) as string;
      const cantidad = Number.parseInt(cantidadStr, 10);
      return {
        camiseta_id: nuevaCamiseta.id,
        talle,
        cantidad: Number.isNaN(cantidad) ? 0 : cantidad,
      };
    })
    .filter((stock) => stock.cantidad > 0);

  if (stockParaInsertar.length > 0) {
    const { error: errorStock } = await supabase
      .from("camisetas_stock")
      .insert(stockParaInsertar);

    if (errorStock) {
      console.error(errorStock);
      return {
        error:
          "Camiseta creada, pero hubo un error al guardar las cantidades de stock.",
        success: false,
      };
    }
  }

  revalidatePath("/stock");

  return { error: null, success: true };
}
