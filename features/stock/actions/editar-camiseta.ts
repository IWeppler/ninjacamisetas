"use server";

import { createClient } from "@/shared/config/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

type UpdateCamisetaData = {
  equipo: string;
  temporada: string;
  tipo: string;
  precio: number;
  precio_costo: number;
  imagen_url?: string;
};

export async function editarCamisetaAction(
  prevState: { error: string | null; success: boolean },
  formData: FormData,
) {
  const id = formData.get("id") as string;
  const equipo = formData.get("equipo") as string;
  const temporada = formData.get("temporada") as string;
  const tipo = formData.get("tipo") as string;
  const precio = Number.parseFloat(formData.get("precio") as string);
  const precio_costo = Number.parseFloat(
    formData.get("precio_costo") as string,
  );
  const archivos = formData.getAll("imagenes") as File[];

  if (
    !id ||
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

  let imagen_url: string | undefined = undefined;

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
      }
    }

    if (urls.length > 0) {
      imagen_url = JSON.stringify(urls);
    }
  }

  // 2. Preparamos los datos a actualizar (Ahora tipado y con precio_costo incluido)
  const updateData: UpdateCamisetaData = {
    equipo,
    temporada,
    tipo,
    precio,
    precio_costo,
  };

  if (imagen_url !== undefined) {
    updateData.imagen_url = imagen_url;
  }

  // 3. Actualizamos la camiseta base
  const { error: errorCamiseta } = await supabase
    .from("camisetas")
    .update(updateData)
    .eq("id", id);

  if (errorCamiseta) {
    console.error(errorCamiseta);
    return {
      error: "Hubo un error al actualizar la camiseta.",
      success: false,
    };
  }

  // 4. Actualizamos el stock
  const tallesPosibles = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const stockParaUpsert = tallesPosibles.map((talle) => {
    const cantidadStr = formData.get(`stock_${talle.toLowerCase()}`) as string;
    const cantidad = Number.parseInt(cantidadStr, 10);
    return {
      camiseta_id: id,
      talle,
      cantidad: Number.isNaN(cantidad) ? 0 : cantidad,
    };
  });

  const { error: errorStock } = await supabase
    .from("camisetas_stock")
    .upsert(stockParaUpsert, { onConflict: "camiseta_id, talle" });

  if (errorStock) {
    console.error(errorStock);
    return {
      error: "Camiseta actualizada, pero hubo un error con el stock.",
      success: false,
    };
  }

  revalidatePath("/stock");

  return { error: null, success: true };
}
