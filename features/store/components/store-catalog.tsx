"use client";

import { useState, useMemo } from "react";
import { Camiseta } from "@/entities/camisetas/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { ShoppingBag, SearchX, Plus } from "lucide-react";
import Link from "next/link";

interface StoreCatalogProps {
  camisetas: Camiseta[];
}

const ITEMS_POR_PAGINA = 12;

export function StoreCatalog({ camisetas }: Readonly<StoreCatalogProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [temporada, setTemporada] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [talle, setTalle] = useState("todos");
  const [orden, setOrden] = useState("recientes");
  const [visibleCount, setVisibleCount] = useState(ITEMS_POR_PAGINA);

  const ordenOptions = [
    { value: "recientes", label: "Últimos ingresos" },
    { value: "menor_precio", label: "Menor precio" },
    { value: "mayor_precio", label: "Mayor precio" },
  ];

  // --- Lógica de filtrado en tiempo real ---
  const camisetasFiltradas = useMemo(() => {
    const resultado = camisetas.filter((c) => {
      const matchSearch = c.equipo
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchTemporada = temporada === "" || c.temporada === temporada;
      const matchTipo =
        tipo === "todos" || c.tipo.toLowerCase() === tipo.toLowerCase();

      const matchTalle =
        talle === "todos" ||
        (c.stock &&
          c.stock.some(
            (s) =>
              s.talle.toLowerCase() === talle.toLowerCase() && s.cantidad > 0,
          ));

      return matchSearch && matchTemporada && matchTipo && matchTalle;
    });

    // Ordenamiento
    resultado.sort((a, b) => {
      if (orden === "recientes") {
        return (
          new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime()
        );
      }
      if (orden === "menor_precio") return a.precio - b.precio;
      if (orden === "mayor_precio") return b.precio - a.precio;
      return 0;
    });

    return resultado;
  }, [camisetas, searchQuery, temporada, tipo, talle, orden]);

  const camisetasVisibles = camisetasFiltradas.slice(0, visibleCount);
  const hayMasCamisetas = visibleCount < camisetasFiltradas.length;

  const handleFiltrar =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (val: string) => {
      setter(val);
      setVisibleCount(ITEMS_POR_PAGINA);
    };

  const limpiarFiltros = () => {
    setSearchQuery("");
    setTemporada("");
    setTipo("todos");
    setTalle("todos");
    setOrden("recientes");
    setVisibleCount(ITEMS_POR_PAGINA);
  };

  const hayFiltrosActivos =
    searchQuery !== "" ||
    temporada !== "" ||
    tipo !== "todos" ||
    talle !== "todos" ||
    orden !== "recientes";

  if (camisetas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <ShoppingBag
          className="w-16 h-16 text-muted-foreground/20 mb-6"
          strokeWidth={1}
        />
        <h2 className="text-2xl font-light text-foreground tracking-tight">
          Catálogo vacío
        </h2>
        <p className="text-muted-foreground mt-2 font-light">
          Pronto subiremos nuevas camisetas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* 1. BARRA DE FILTROS (Mantenemos la lógica, pero idealmente se estilaría más flat en su propio archivo luego) */}
      <div className="mb-8">
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={handleFiltrar(setSearchQuery)}
          searchPlaceholder="Buscar equipo..."
          temporada={temporada}
          onTemporadaChange={handleFiltrar(setTemporada)}
          tipo={tipo}
          onTipoChange={handleFiltrar(setTipo)}
          talle={talle}
          onTalleChange={handleFiltrar(setTalle)}
          orden={orden}
          onOrdenChange={handleFiltrar(setOrden)}
          ordenOptions={ordenOptions}
          onLimpiar={limpiarFiltros}
          hayFiltrosActivos={hayFiltrosActivos}
        />
      </div>

      {/* 2. GRILLA DE PRODUCTOS */}
      {camisetasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/30">
          <SearchX
            className="w-12 h-12 text-muted-foreground/30 mb-4"
            strokeWidth={1}
          />
          <h2 className="text-xl font-medium text-foreground tracking-tight">
            No encontramos resultados
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Intenta cambiar los filtros o buscar de otra manera.
          </p>
          <Button
            variant="link"
            className="mt-4 text-foreground underline underline-offset-4"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
          {/* Grilla expandida: 2 col en móvil, 3 en tablet, 4 en desktop normal, 5 en ultra-wide */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
            {camisetasVisibles.map((camiseta) => {
              let imagenes: string[] = [];
              if (Array.isArray(camiseta.imagen_url)) {
                imagenes = camiseta.imagen_url;
              } else if (typeof camiseta.imagen_url === "string") {
                try {
                  const parsed = JSON.parse(camiseta.imagen_url);
                  imagenes = Array.isArray(parsed)
                    ? parsed
                    : [camiseta.imagen_url];
                } catch {
                  imagenes = [camiseta.imagen_url];
                }
              }

              const primeraImagen = imagenes[0] || null;
              const segundaImagen = imagenes.length > 1 ? imagenes[1] : null;
              const linkDestino = camiseta.slug
                ? `/store/${camiseta.slug}`
                : "#";

              return (
                <div
                  key={camiseta.id}
                  className="group relative flex flex-col transition-all"
                >
                  <Link
                    href={linkDestino}
                    className="aspect-4/5 bg-[#f7f7f7] relative overflow-hidden flex items-center justify-center w-full"
                  >
                    {primeraImagen ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={primeraImagen}
                          alt={camiseta.equipo}
                          className={`object-cover w-full h-full transition-opacity duration-500 ease-in-out ${
                            segundaImagen ? "group-hover:opacity-0" : ""
                          }`}
                        />
                        {/* Segunda imagen al hacer hover */}
                        {segundaImagen && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={segundaImagen}
                            alt={`${camiseta.equipo} detalle`}
                            className="absolute inset-0 object-cover w-full h-full opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                          />
                        )}
                      </>
                    ) : (
                      <ShoppingBag
                        className="w-10 h-10 text-muted-foreground/20"
                        strokeWidth={1}
                      />
                    )}

                    {/* Sutil Badge de Tipo (Opcional, estilo minimalista) */}
                    {camiseta.tipo && (
                      <div className="absolute top-3 left-3 z-5">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 text-black rounded-none uppercase text-[9px] font-bold tracking-widest px-2 py-0.5 border-none shadow-none"
                        >
                          {camiseta.tipo}
                        </Badge>
                      </div>
                    )}
                  </Link>

                  {/* Información - Tipografía limpia, alineada a la izquierda, sin padding agresivo */}
                  <div className="pt-4 flex flex-col">
                    <Link
                      href={linkDestino}
                      className="hover:underline decoration-1 underline-offset-4"
                    >
                      <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide truncate">
                        {camiseta.equipo}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-light">
                      {camiseta.temporada}
                    </p>
                    <div className="mt-2">
                      <span className="text-sm font-semibold text-foreground">
                        ${camiseta.precio.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. BOTÓN DE CARGAR MÁS  */}
          {hayMasCamisetas && (
            <div className="flex justify-center pt-12 pb-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  setVisibleCount((prev) => prev + ITEMS_POR_PAGINA)
                }
                className="w-full sm:w-auto font-medium rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background px-12 uppercase tracking-widest text-xs transition-colors cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Cargar más
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
