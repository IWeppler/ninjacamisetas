import { Venta } from "@/entities/ventas/types";
import { Camiseta } from "@/entities/camisetas/types";

export function getDashboardMetrics(
  ventas: Venta[],
  camisetas: Camiseta[],
  periodo: "mes" | "historico" = "mes",
) {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Contexto Temporal Consistente (Afecta KPIs y Rankings)
  const ventasFiltradas =
    periodo === "mes"
      ? ventas.filter((v) => new Date(v.fecha_venta) >= startOfThisMonth)
      : ventas;

  // --- CORE KPIs ---
  let ingresos = 0;
  let ingresosConCosto = 0;
  let ganancia = 0;
  let unidadesVendidas = 0;

  ventasFiltradas.forEach((v) => {
    // 6. Refactor limpio: evitamos llamar Number() mil veces
    const total = Number(v.total);
    const cantidad = Number(v.cantidad);
    const precio = Number(v.precio_unitario);
    const costoUnitario = Number(v.precio_costo ?? 0);

    ingresos += total;
    unidadesVendidas += cantidad;

    // 2. Cálculo de Margen Seguro y Real
    // Solo medimos rentabilidad sobre productos que SÍ tienen costo registrado
    if (costoUnitario > 0) {
      ingresosConCosto += total;
      ganancia += (precio - costoUnitario) * cantidad;
    }
  });

  const ordenes = ventasFiltradas.length;
  const ticketPromedio = ordenes > 0 ? ingresos / ordenes : 0;

  // Porcentaje sobre ingresos que SÍ tienen costo para no inflar falsamente
  const margenPorcentaje =
    ingresosConCosto > 0 ? (ganancia / ingresosConCosto) * 100 : 0;

  // --- OPERATIVO ---
  let stockTotalUnidades = 0;
  let stockValorizadoCosto = 0;
  let productosCriticos = 0;

  camisetas.forEach((cam) => {
    const costo = Number(cam.precio_costo ?? 0);

    // 3. Stock Crítico Evaluado POR TALLE
    cam.stock?.forEach((s) => {
      const cantidadStock = Number(s.cantidad);
      stockTotalUnidades += cantidadStock;
      stockValorizadoCosto += cantidadStock * costo;

      if (cantidadStock > 0 && cantidadStock <= 3) {
        productosCriticos++;
      }
    });
  });

  // --- INTELIGENCIA ---
  const ventasPorProducto = ventasFiltradas.reduce(
    (acc, v) => {
      const id = v.camiseta_id || "eliminado";
      const total = Number(v.total);
      const cantidad = Number(v.cantidad);
      const precio = Number(v.precio_unitario);
      const costoUnitario = Number(v.precio_costo ?? 0);

      if (!acc[id]) {
        acc[id] = {
          nombre: v.camiseta
            ? `${v.camiseta.equipo} (${v.camiseta.temporada})`
            : "Producto Eliminado",
          ingresos: 0,
          unidades: 0,
          ganancia: 0,
        };
      }

      acc[id].ingresos += total;
      acc[id].unidades += cantidad;

      if (costoUnitario > 0) {
        acc[id].ganancia += (precio - costoUnitario) * cantidad;
      }

      return acc;
    },
    {} as Record<
      string,
      { nombre: string; ingresos: number; unidades: number; ganancia: number }
    >,
  );

  // 4. Rankings Múltiples (Rotación y Rentabilidad)
  const topProductosUnidades = Object.values(ventasPorProducto)
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5);

  const topProductosRentables = Object.values(ventasPorProducto)
    .sort((a, b) => b.ganancia - a.ganancia)
    .slice(0, 5);

  return {
    ingresos,
    ordenes,
    unidadesVendidas,
    ticketPromedio,
    ganancia,
    margenPorcentaje,
    stockTotalUnidades,
    stockValorizadoCosto,
    productosCriticos,
    topProductos: topProductosUnidades, // Exportamos el top de rotación (más vendidos)
    topProductosRentables, // Exportamos el top de rentabilidad (dejan más margen)
  };
}
