"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Image as ImageIcon, ShoppingBag, ShoppingCart } from "lucide-react";
import { EditarProductoModal } from "./edit-modal";
import { EliminarProductoModal } from "./delete-modal";
import { TogglePublicado } from "./toggle-publicado";
import { Producto } from "@/entities/productos/types";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { toast } from "sonner";
import { useCartStore } from "@/shared/store/cart-store";

interface StockTableProps {
  productos: Producto[];
}

const formatearMoneda = (monto: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
};

const ORDEN_TALLES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export function StockTable({ productos }: Readonly<StockTableProps>) {
  const addItem = useCartStore((state: any) => state.addItem);
  const setIsOpen = useCartStore((state: any) => state.setIsOpen);

  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-border">
        <p className="text-muted-foreground">
          No hay productos en el inventario.
        </p>
      </div>
    );
  }

  // Ahora la venta rápida impacta el estado global y abre el sidebar
  const handleAñadirAlCarrito = (producto: Producto, variante: string) => {
    // Buscamos el stock máximo de esa variante para limitarlo en el carrito
    const stockDeVariante =
      producto.stock?.find((s) => s.variante === variante)?.cantidad || 0;

    // Obtenemos la primera imagen para el carrito de forma segura
    let primeraImagen = null;
    if (Array.isArray(producto.imagen_url) && producto.imagen_url.length > 0) {
      primeraImagen = producto.imagen_url[0];
    } else if (typeof producto.imagen_url === "string") {
      try {
        const parsed = JSON.parse(producto.imagen_url);
        primeraImagen = Array.isArray(parsed) ? parsed[0] : producto.imagen_url;
      } catch {
        primeraImagen = producto.imagen_url;
      }
    }

    // Armamos el objeto tal cual lo espera tu cart-sidebar
    const itemData = {
      productoId: producto.id,
      nombre: producto.nombre,
      temporada: producto.temporada,
      variante: variante,
      cantidad: 1,
      precio: producto.precio,
      precioUnitario: producto.precio,
      imagenUrl: primeraImagen,
      stockMaximo: stockDeVariante,
    };

    if (addItem) {
      addItem(itemData);
      setIsOpen(true);
      toast.success("Añadido al carrito", {
        description: `1x ${producto.nombre} (Talle: ${variante})`,
      });
    } else {
      toast.error("El método addItem no existe en el cart-store");
    }
  };

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
            <TableHead className="text-center">Visible</TableHead>
            <TableHead className="text-right">Costo</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((producto) => {
            let primeraImagen = null;
            if (
              Array.isArray(producto.imagen_url) &&
              producto.imagen_url.length > 0
            ) {
              primeraImagen = producto.imagen_url[0];
            } else if (typeof producto.imagen_url === "string") {
              if (producto.imagen_url.startsWith("[")) {
                try {
                  const parsed = JSON.parse(producto.imagen_url);
                  primeraImagen = Array.isArray(parsed)
                    ? parsed[0]
                    : producto.imagen_url;
                } catch {
                  primeraImagen = producto.imagen_url;
                }
              } else {
                primeraImagen = producto.imagen_url;
              }
            }

            // Calculamos la ganancia unitaria estimada (Venta - Costo) de forma tipada
            const precioCosto = producto.precio_costo || 0;
            const margenEstiado = producto.precio - precioCosto;

            const stockOrdenado = producto.stock
              ? [...producto.stock].sort((a, b) => {
                  const indexA = ORDEN_TALLES.indexOf(a.variante.toUpperCase());
                  const indexB = ORDEN_TALLES.indexOf(b.variante.toUpperCase());
                  return (
                    (indexA === -1 ? 99 : indexA) -
                    (indexB === -1 ? 99 : indexB)
                  );
                })
              : [];

            return (
              <TableRow key={producto.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden border border-border">
                    {primeraImagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primeraImagen}
                        alt={producto.nombre}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground opacity-50" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-card-foreground">
                  {producto.nombre}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {producto.temporada}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {producto.tipo}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {stockOrdenado.length > 0 ? (
                      stockOrdenado.map((s) => (
                        <Badge
                          key={s.id}
                          variant={s.cantidad > 0 ? "outline" : "destructive"}
                          className="text-xs"
                        >
                          {s.variante}: {s.cantidad}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Sin definir
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <TogglePublicado
                    id={producto.id}
                    publicadoInicial={producto.publicado ?? true}
                  />
                </TableCell>

                <TableCell className="text-right text-muted-foreground font-medium">
                  {formatearMoneda(precioCosto)}
                </TableCell>
                <TableCell
                  className="text-right font-medium"
                  title={`Ganancia estimada: ${formatearMoneda(margenEstiado)}`}
                >
                  {formatearMoneda(producto.precio)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Botón de Venta Rápida */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground/80 h-8 w-8 cursor-pointer"
                          title="Venta Rápida"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-52 p-3 z-10" align="end">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold leading-none">
                              Añadir al carrito
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Selecciona el talle a vender:
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {stockOrdenado.length > 0 ? (
                              stockOrdenado.map((s) => (
                                <Button
                                  key={s.id}
                                  variant="outline"
                                  size="sm"
                                  disabled={s.cantidad <= 0}
                                  onClick={() =>
                                    handleAñadirAlCarrito(producto, s.variante)
                                  }
                                  className="h-8 text-xs font-medium"
                                >
                                  {s.variante}
                                </Button>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground col-span-3 text-center py-2">
                                Sin stock disponible
                              </p>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <EditarProductoModal producto={producto} />
                    <EliminarProductoModal
                      id={producto.id}
                      nombre={producto.nombre}
                      temporada={producto.temporada}
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
