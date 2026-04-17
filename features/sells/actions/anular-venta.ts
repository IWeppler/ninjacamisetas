"use server";

import { createClient } from "@/shared/config/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function anularVentaAction(ventaId: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Obtener detalles de la venta antes de borrarla
    const { data: venta, error: fetchError } = await supabase
      .from("ventas")
      .select("camiseta_id, talle, cantidad")
      .eq("id", ventaId)
      .single();

    if (fetchError || !venta) {
      return { error: "No se encontró la venta solicitada.", success: false };
    }

    // 2. Eliminar el registro de la venta
    const { error: deleteError } = await supabase
      .from("ventas")
      .delete()
      .eq("id", ventaId);

    if (deleteError) {
      console.error(deleteError);
      return { error: "Error al intentar anular la venta.", success: false };
    }

    // 3. Restaurar stock (Solo si el producto original aún existe)
    if (venta.camiseta_id) {
      const { data: stockActual } = await supabase
        .from("camisetas_stock")
        .select("id, cantidad")
        .eq("camiseta_id", venta.camiseta_id)
        .eq("talle", venta.talle)
        .single();

      if (stockActual) {
        await supabase
          .from("camisetas_stock")
          .update({ cantidad: stockActual.cantidad + venta.cantidad })
          .eq("id", stockActual.id);
      } else {
        await supabase.from("camisetas_stock").insert({
          camiseta_id: venta.camiseta_id,
          talle: venta.talle,
          cantidad: venta.cantidad,
        });
      }
    }

    // 4. Refrescamos las vistas
    revalidatePath("/ventas");
    revalidatePath("/stock");

    return { error: null, success: true };
  } catch (err) {
    console.error("Error in anularVentaAction:", err);
    return {
      error: "Ocurrió un error inesperado al intentar anular.",
      success: false,
    };
  }
}
