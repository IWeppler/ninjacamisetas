"use client";

import { Camiseta } from "@/entities/camisetas/types";
import { Badge } from "@/shared/ui/badge";
import { Image as ImageIcon } from "lucide-react";
import { EditarCamisetaModal } from "./editar-modal";
import { EliminarCamisetaModal } from "./eliminar-modal";

interface StockGridProps {
  camisetas: Camiseta[];
}

export function StockGrid({ camisetas }: Readonly<StockGridProps>) {
  if (camisetas.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-border">
        <p className="text-muted-foreground">
          No hay camisetas en el inventario.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {camisetas.map((camiseta) => {
        let primeraImagen = null;
        if (
          Array.isArray(camiseta.imagen_url) &&
          camiseta.imagen_url.length > 0
        ) {
          primeraImagen = camiseta.imagen_url[0];
        } else if (typeof camiseta.imagen_url === "string") {
          if (camiseta.imagen_url.startsWith("[")) {
            try {
              const parsed = JSON.parse(camiseta.imagen_url);
              primeraImagen = Array.isArray(parsed)
                ? parsed[0]
                : camiseta.imagen_url;
            } catch {
              primeraImagen = camiseta.imagen_url;
            }
          } else {
            primeraImagen = camiseta.imagen_url;
          }
        }

        const precioCosto = (camiseta as any).precio_costo || 0;

        return (
          <div
            key={camiseta.id}
            className="flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Contenedor de Imagen */}
            <div className="aspect-square bg-muted flex items-center justify-center relative border-b border-border">
              {primeraImagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primeraImagen}
                  alt={camiseta.equipo}
                  className="object-cover w-full h-full"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground opacity-30" />
              )}
              {/* Badge flotante de Tipo */}
              <div className="absolute top-3 right-3">
                <Badge
                  variant="secondary"
                  className="shadow-sm backdrop-blur-sm bg-background/80"
                >
                  {camiseta.tipo}
                </Badge>
              </div>
            </div>

            {/* Contenido (Info) */}
            <div className="p-4 flex flex-col flex-1">
              <h3
                className="font-bold text-lg leading-tight truncate"
                title={camiseta.equipo}
              >
                {camiseta.equipo}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {camiseta.temporada}
              </p>

              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Stock Disponible
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {camiseta.stock && camiseta.stock.length > 0 ? (
                    camiseta.stock.map((s) => (
                      <Badge
                        key={s.id}
                        variant={s.cantidad > 0 ? "outline" : "destructive"}
                        className="text-xs px-1.5"
                      >
                        {s.talle}: {s.cantidad}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Sin definir
                    </span>
                  )}
                </div>
              </div>

              {/* Spacer para empujar el precio y botones hacia abajo */}
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-primary leading-none">
                    ${camiseta.precio.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 font-medium">
                    Costo: ${precioCosto.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <EditarCamisetaModal camiseta={camiseta} />
                  <EliminarCamisetaModal
                    id={camiseta.id}
                    equipo={camiseta.equipo}
                    temporada={camiseta.temporada}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
