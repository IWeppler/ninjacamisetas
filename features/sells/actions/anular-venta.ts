"use server";

import { createClient } from "@/shared/config/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function anularVentaAction(ventaId: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Primero LEEMOS la venta antes de borrarla
    const { data: venta, error: selectError } = await supabase
      .from("ventas")
      .select("producto_id, variante, cantidad")
      .eq("id", ventaId)
      .single();

    if (selectError || !venta) {
      console.warn("Venta no encontrada", selectError);
      return {
        error: "Esta venta no existe en el sistema.",
        success: false,
      };
    }

    // 2. Luego la BORRAMOS por separado
    const { error: deleteError, count } = await supabase
      .from("ventas")
      .delete()
      .eq("id", ventaId);

    console.log("Delete result:", { deleteError, count });

    if (deleteError) {
      console.error("Error al borrar la venta", deleteError);
      return {
        error: "No se pudo anular la venta.",
        success: false,
      };
    }

    // 3. Restaurar stock
    if (venta.producto_id) {
      const { data: stockActual } = await supabase
        .from("productos_stock")
        .select("id, cantidad")
        .eq("producto_id", venta.producto_id)
        .eq("variante", venta.variante)
        .single();

      if (stockActual) {
        await supabase
          .from("productos_stock")
          .update({ cantidad: stockActual.cantidad + venta.cantidad })
          .eq("id", stockActual.id);
      } else {
        await supabase.from("productos_stock").insert({
          producto_id: venta.producto_id,
          variante: venta.variante,
          cantidad: venta.cantidad,
        });
      }
    }

    revalidatePath("/", "layout");
    return { error: null, success: true };
  } catch (err) {
    console.error("Error in anularVentaAction:", err);
    return {
      error: "Ocurrió un error inesperado al intentar anular.",
      success: false,
    };
  }
}
