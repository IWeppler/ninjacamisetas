"use client";

import { Camiseta } from "@/entities/camisetas/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Image as ImageIcon } from "lucide-react";
import { EditarCamisetaModal } from "./editar-modal";
import { EliminarCamisetaModal } from "./eliminar-modal";

interface StockTableProps {
  camisetas: readonly Camiseta[];
}

const formatearMoneda = (monto: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
};

export function StockTable({ camisetas }: Readonly<StockTableProps>) {
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
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead>Temporada</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Stock por Talle</TableHead>
            <TableHead className="text-right">Costo</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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

            const precioCosto = camiseta.precio_costo || 0;
            const margenEstiado = camiseta.precio - precioCosto;

            return (
              <TableRow key={camiseta.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden border border-border">
                    {primeraImagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primeraImagen}
                        alt={camiseta.equipo}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground opacity-50" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-card-foreground">
                  {camiseta.equipo}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {camiseta.temporada}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {camiseta.tipo}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {camiseta.stock && camiseta.stock.length > 0 ? (
                      camiseta.stock.map((s) => (
                        <Badge
                          key={s.id}
                          variant={s.cantidad > 0 ? "outline" : "destructive"}
                          className="text-xs"
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
                </TableCell>

                <TableCell className="text-right text-muted-foreground font-medium">
                  {formatearMoneda(precioCosto)}
                </TableCell>
                <TableCell
                  className="text-right font-medium"
                  title={`Ganancia estimada: ${formatearMoneda(margenEstiado)}`}
                >
                  {formatearMoneda(camiseta.precio)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <EditarCamisetaModal camiseta={camiseta} />
                    <EliminarCamisetaModal
                      id={camiseta.id}
                      equipo={camiseta.equipo}
                      temporada={camiseta.temporada}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
