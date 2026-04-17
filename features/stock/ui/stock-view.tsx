"use client";

import { useState, useMemo } from "react";
import { Camiseta } from "@/entities/camisetas/types";
import { StockTable } from "./stock-table";
import { StockGrid } from "./stock-grid";
import { Button } from "@/shared/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { CrearCamisetaModal } from "./stock-modal";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";

interface StockViewProps {
  camisetas: Camiseta[];
}

export function StockView({ camisetas }: Readonly<StockViewProps>) {
  const [view, setView] = useState<"table" | "grid">("table");

  // Estados de filtros para Stock
  const [filtroEquipo, setFiltroEquipo] = useState("");
  const [filtroTemporada, setFiltroTemporada] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroTalle, setFiltroTalle] = useState("todos");
  const [orden, setOrden] = useState("recientes");

  const ordenOptions = [
    { value: "recientes", label: "Agregados recientemente" },
    { value: "antiguos", label: "Más antiguos" },
    { value: "mayor_precio", label: "Mayor precio" },
    { value: "menor_precio", label: "Menor precio" },
  ];

  const camisetasFiltradasYOrdenadas = useMemo(() => {
    const resultado = camisetas.filter((camiseta) => {
      const equipo = camiseta.equipo?.toLowerCase() || "";
      const temporada = camiseta.temporada?.toLowerCase() || "";
      const tipo = camiseta.tipo?.toLowerCase() || "";

      let tieneTalle = false;
      if (filtroTalle === "todos") {
        tieneTalle = true;
      } else if (camiseta.stock) {
        tieneTalle = camiseta.stock.some(
          (s) =>
            s.talle.toLowerCase() === filtroTalle.toLowerCase() &&
            s.cantidad > 0,
        );
      }

      const matchEquipo = equipo.includes(filtroEquipo.toLowerCase());
      const matchTemporada = temporada.includes(filtroTemporada.toLowerCase());
      const matchTipo =
        filtroTipo === "todos" || tipo === filtroTipo.toLowerCase();

      return matchEquipo && matchTemporada && matchTipo && tieneTalle;
    });

    resultado.sort((a, b) => {
      switch (orden) {
        case "recientes":
          return (
            new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime()
          );
        case "antiguos":
          return (
            new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime()
          );
        case "mayor_precio":
          return b.precio - a.precio;
        case "menor_precio":
          return a.precio - b.precio;
        default:
          return 0;
      }
    });

    return resultado;
  }, [
    camisetas,
    filtroEquipo,
    filtroTemporada,
    filtroTipo,
    filtroTalle,
    orden,
  ]);

  const limpiarFiltros = () => {
    setFiltroEquipo("");
    setFiltroTemporada("");
    setFiltroTipo("todos");
    setFiltroTalle("todos");
    setOrden("recientes");
  };

  const hayFiltrosActivos =
    filtroEquipo !== "" ||
    filtroTemporada !== "" ||
    filtroTipo !== "todos" ||
    filtroTalle !== "todos" ||
    orden !== "recientes";

  const actionButtons = (
    <>
      <div className="flex items-center gap-1 bg-muted p-1 rounded-md w-full sm:w-auto justify-center mr-2">
        <Button
          variant={view === "table" ? "default" : "ghost"}
          className={`w-full sm:w-auto font-medium transition-all ${
            view !== "table"
              ? "cursor-pointer text-muted-foreground hover:text-foreground"
              : "shadow-sm bg-neutral-900"
          }`}
          onClick={() => setView("table")}
        >
          <List className="h-4 w-4 mr-1" /> Tabla
        </Button>
        <Button
          variant={view === "grid" ? "default" : "ghost"}
          className={`w-full sm:w-auto font-medium transition-all ${
            view !== "grid"
              ? "cursor-pointer text-muted-foreground hover:text-foreground"
              : "shadow-sm bg-neutral-900"
          }`}
          onClick={() => setView("grid")}
        >
          <LayoutGrid className="h-4 w-4 mr-1" /> Grilla
        </Button>
      </div>
      <div className="w-full sm:w-auto">
        <CrearCamisetaModal />
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <FilterToolbar
        searchQuery={filtroEquipo}
        onSearchChange={setFiltroEquipo}
        searchPlaceholder="Buscar por equipo..."
        temporada={filtroTemporada}
        onTemporadaChange={setFiltroTemporada}
        tipo={filtroTipo}
        onTipoChange={setFiltroTipo}
        talle={filtroTalle}
        onTalleChange={setFiltroTalle}
        orden={orden}
        onOrdenChange={setOrden}
        ordenOptions={ordenOptions}
        onLimpiar={limpiarFiltros}
        hayFiltrosActivos={hayFiltrosActivos}
        actionButtons={actionButtons}
      />

      {view === "table" ? (
        <StockTable camisetas={camisetasFiltradasYOrdenadas} />
      ) : (
        <StockGrid camisetas={camisetasFiltradasYOrdenadas} />
      )}
    </div>
  );
}
