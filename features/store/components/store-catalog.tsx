"use client";

import { useState, useMemo, Suspense } from "react";
import { Producto } from "@/entities/productos/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ShoppingBag, SearchX, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getTemporadaActual } from "@/entities/productos/constants";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";

interface StoreCatalogProps {
  productos: Producto[];
}

const ITEMS_POR_PAGINA = 12;

function CatalogContent({ productos }: Readonly<{ productos: Producto[] }>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = searchParams.get("q") || "";

  const [categoria, setCategoria] = useState("todas");
  const [tipo, setTipo] = useState("todos");
  const [variante, setVariante] = useState("todos");
  const [orden, setOrden] = useState("recientes");
  const [visibleCount, setVisibleCount] = useState(ITEMS_POR_PAGINA);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const ordenOptions = [
    { value: "recientes", label: "Últimos ingresos" },
    { value: "menor_precio", label: "Menor precio" },
    { value: "mayor_precio", label: "Mayor precio" },
  ];

  const productosFiltradas = useMemo(() => {
    const temporadaActual = getTemporadaActual();

    const resultado = productos.filter((c) => {
      const nombreStr = c.nombre || "";
      const tipoStr = (c.tipo || "").toLowerCase();
      const tempStr = c.temporada || "";

      const matchSearch = nombreStr
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // SMART FILTERS: Traducción UI -> Base de datos
      let matchCategoria = true;
      if (categoria === "actual") {
        matchCategoria = tempStr === temporadaActual && tipoStr !== "retro";
      } else if (categoria === "otras") {
        matchCategoria = tempStr !== temporadaActual && tipoStr !== "retro";
      } else if (categoria === "retro") {
        matchCategoria = tipoStr === "retro";
      }

      let matchTipo = true;
      if (categoria !== "retro" && tipo !== "todos") {
        matchTipo = tipoStr === tipo.toLowerCase();
      }

      const matchVariante =
        variante === "todos" ||
        (c.stock &&
          c.stock.some(
            (s) =>
              (s.variante || "").toLowerCase() === variante.toLowerCase() &&
              s.cantidad > 0,
          ));

      return matchSearch && matchCategoria && matchTipo && matchVariante;
    });

    resultado.sort((a, b) => {
      if (orden === "recientes") {
        return (
          new Date(b.creado_en || 0).getTime() -
          new Date(a.creado_en || 0).getTime()
        );
      }
      if (orden === "menor_precio") return (a.precio || 0) - (b.precio || 0);
      if (orden === "mayor_precio") return (b.precio || 0) - (a.precio || 0);
      return 0;
    });

    return resultado;
  }, [productos, searchQuery, categoria, tipo, variante, orden]);

  const productosVisibles = productosFiltradas.slice(0, visibleCount);
  const hayMasProductos = visibleCount < productosFiltradas.length;

  const handleFiltrar =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (val: string) => {
      setter(val);
      setVisibleCount(ITEMS_POR_PAGINA);
    };

  const limpiarFiltros = () => {
    setCategoria("todas");
    setTipo("todos");
    setVariante("todos");
    setOrden("recientes");
    setVisibleCount(ITEMS_POR_PAGINA);
    setIsMobileFiltersOpen(false);

    if (searchQuery) {
      router.replace(pathname);
    }
  };

  const hayFiltrosActivos =
    categoria !== "todas" ||
    tipo !== "todos" ||
    variante !== "todos" ||
    orden !== "recientes" ||
    searchQuery !== "";

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <ShoppingBag
          className="w-16 h-16 text-muted-foreground/20 mb-6"
          strokeWidth={1}
        />
        <h2 className="text-2xl font-light text-foreground tracking-tight">
          Catálogo vacío
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterToolbar
        categoria={categoria}
        onCategoriaChange={handleFiltrar(setCategoria)}
        tipo={tipo}
        onTipoChange={handleFiltrar(setTipo)}
        variante={variante}
        onVarianteChange={handleFiltrar(setVariante)}
        orden={orden}
        onOrdenChange={handleFiltrar(setOrden)}
        ordenOptions={ordenOptions}
        onLimpiar={limpiarFiltros}
        hayFiltrosActivos={hayFiltrosActivos}
      />

      {/* GRILLA DE PRODUCTOS */}
      {productosFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <SearchX
            className="w-12 h-12 text-muted-foreground/30 mb-4"
            strokeWidth={1}
          />
          <h2 className="text-xl font-medium text-foreground tracking-tight">
            No encontramos resultados
          </h2>
          <Button
            variant="link"
            className="mt-4 text-foreground underline underline-offset-4 cursor-pointer"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
            {productosVisibles.map((producto) => {
              let imagenes: string[] = [];
              if (Array.isArray(producto.imagen_url)) {
                imagenes = producto.imagen_url;
              } else if (typeof producto.imagen_url === "string") {
                try {
                  const parsed = JSON.parse(producto.imagen_url);
                  imagenes = Array.isArray(parsed)
                    ? parsed
                    : [producto.imagen_url];
                } catch {
                  imagenes = [producto.imagen_url];
                }
              }

              const primeraImagen = imagenes[0] || null;
              const linkDestino = producto.slug
                ? `/store/${producto.slug}`
                : "#";

              return (
                <div
                  key={producto.id}
                  className="group relative flex flex-col border border-transparent transition-colors hover:border-muted-foreground"
                >
                  <Link
                    href={linkDestino}
                    className="aspect-4/5 bg-[#f7f7f7] relative overflow-hidden flex items-center justify-center w-full shadow-none border border-border/40"
                  >
                    {primeraImagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primeraImagen}
                        alt={producto.nombre || "Producto"}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <ShoppingBag
                        className="w-10 h-10 text-muted-foreground/20"
                        strokeWidth={1}
                      />
                    )}

                    {producto.tipo && (
                      <div className="absolute top-3 left-3 z-5">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 text-black rounded-none uppercase text-[9px] font-medium tracking-widest px-2 py-0.5 border-none shadow-none"
                        >
                          {producto.tipo}
                        </Badge>
                      </div>
                    )}
                  </Link>

                  <div className="pt-4 p-1 flex justify-between">
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={linkDestino}
                        className="hover:underline decoration-1 underline-offset-4"
                      >
                        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide truncate">
                          {producto.nombre || "Sin nombre"}
                        </h3>
                      </Link>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">
                        {producto.temporada}
                      </p>
                    </div>

                    <span className="text-md font-bold text-foreground shrink-0">
                      ${(producto.precio || 0).toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {hayMasProductos && (
            <div className="flex justify-center pt-12 pb-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  setVisibleCount((prev) => prev + ITEMS_POR_PAGINA)
                }
                className="w-full sm:w-auto font-bold rounded-none border-border shadow-none text-foreground hover:bg-neutral-900 hover:text-white px-12 uppercase tracking-widest text-xs transition-colors h-14 cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" /> Cargar más
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function StoreCatalog({ productos }: Readonly<StoreCatalogProps>) {
  return (
    <Suspense
      fallback={
        <div className="py-32 text-center uppercase tracking-widest font-medium text-muted-foreground">
          Cargando catálogo...
        </div>
      }
    >
      <CatalogContent productos={productos} />
    </Suspense>
  );
}
