"use client";

import { useState, useMemo } from "react";
import { Camiseta } from "@/entities/camisetas/types";
import { StockTable } from "./stock-table";
import { StockGrid } from "./stock-grid";
import { Button } from "@/shared/ui/button";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { CrearCamisetaModal } from "./stock-modal";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";

interface StockViewProps {
  camisetas: Camiseta[];
}

export function StockView({ camisetas }: Readonly<StockViewProps>) {
  const [view, setView] = useState<"table" | "grid">("table");

  // --- NUEVO: Paginación ---
  const ITEMS_POR_PAGINA = 10;
  const [paginaActual, setPaginaActual] = useState(1);

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

      // Para el talle en stock, verificamos si existe en el array de stock y tiene cantidad > 0
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

  // --- NUEVO: Lógica de Paginación ---
  const totalPaginas = Math.ceil(
    camisetasFiltradasYOrdenadas.length / ITEMS_POR_PAGINA,
  );
  const camisetasPaginadas = camisetasFiltradasYOrdenadas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA,
  );

  const limpiarFiltros = () => {
    setFiltroEquipo("");
    setFiltroTemporada("");
    setFiltroTipo("todos");
    setFiltroTalle("todos");
    setOrden("recientes");
    setPaginaActual(1); // Reiniciamos paginación al limpiar
  };

  // Funciones wrapper para reiniciar la paginación al filtrar
  const handleFiltroEquipo = (v: string) => {
    setFiltroEquipo(v);
    setPaginaActual(1);
  };
  const handleFiltroTemporada = (v: string) => {
    setFiltroTemporada(v);
    setPaginaActual(1);
  };
  const handleFiltroTipo = (v: string) => {
    setFiltroTipo(v);
    setPaginaActual(1);
  };
  const handleFiltroTalle = (v: string) => {
    setFiltroTalle(v);
    setPaginaActual(1);
  };
  const handleOrden = (v: string) => {
    setOrden(v);
    setPaginaActual(1);
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
        onSearchChange={handleFiltroEquipo}
        searchPlaceholder="Buscar por equipo..."
        temporada={filtroTemporada}
        onTemporadaChange={handleFiltroTemporada}
        tipo={filtroTipo}
        onTipoChange={handleFiltroTipo}
        talle={filtroTalle}
        onTalleChange={handleFiltroTalle}
        orden={orden}
        onOrdenChange={handleOrden}
        ordenOptions={ordenOptions}
        onLimpiar={limpiarFiltros}
        hayFiltrosActivos={hayFiltrosActivos}
        actionButtons={actionButtons}
      />

      {/* Le pasamos el array PAGINADO a las vistas */}
      {view === "table" ? (
        <StockTable camisetas={camisetasPaginadas} />
      ) : (
        <StockGrid camisetas={camisetasPaginadas} />
      )}

      {/* CONTROLES DE PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t border-border mt-4">
          <span className="text-sm text-muted-foreground">
            Mostrando{" "}
            {Math.min(
              camisetasFiltradasYOrdenadas.length,
              (paginaActual - 1) * ITEMS_POR_PAGINA + 1,
            )}{" "}
            a{" "}
            {Math.min(
              camisetasFiltradasYOrdenadas.length,
              paginaActual * ITEMS_POR_PAGINA,
            )}{" "}
            de {camisetasFiltradasYOrdenadas.length} camisetas
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <div className="text-sm font-medium px-4">
              Página {paginaActual} de {totalPaginas}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPaginaActual((p) => Math.min(totalPaginas, p + 1))
              }
              disabled={paginaActual === totalPaginas}
            >
              Siguiente <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
