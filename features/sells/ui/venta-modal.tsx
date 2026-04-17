"use client";

import { useState, useActionState, useEffect, useMemo } from "react";
import { registrarVentaAction } from "../actions/registrar-venta";
import { getCamisetasAction } from "@/features/stock/actions/stock";
import { Camiseta } from "@/entities/camisetas/types";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Plus, Loader2, Trash2, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";

interface Props {
  camisetas?: Camiseta[];
}

type CartItem = {
  camisetaId: string;
  equipo: string;
  temporada: string;
  talle: string;
  cantidad: number;
  precioUnitario: number;
};

export function RegistrarVentaModal({ camisetas = [] }: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // Estado del "Carrito de compras"
  const [items, setItems] = useState<CartItem[]>([]);

  // Controles temporales para agregar un nuevo ítem
  const [selectedCamisetaId, setSelectedCamisetaId] = useState<
    string | undefined
  >();
  const [selectedTalle, setSelectedTalle] = useState<string | undefined>();
  const [cantidadToAdd, setCantidadToAdd] = useState<number>(1);

  // Estados para manejar el stock en tiempo real
  const [listaCamisetas, setListaCamisetas] = useState<Camiseta[]>(camisetas);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStock = async () => {
      setIsLoadingStock(true);
      try {
        const res = await getCamisetasAction();
        if (res.data) setListaCamisetas(res.data);
      } finally {
        setIsLoadingStock(false);
      }
    };

    fetchStock();
  }, [isOpen]);

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: { error: string | null; success: boolean },
      formData: FormData,
    ) => {
      const result = await registrarVentaAction(prevState, formData);

      if (result.success) {
        setIsOpen(false);
        resetForm();
        toast.success("¡Venta registrada con éxito!");
      } else if (result.error) {
        toast.error(result.error);
      }

      return result;
    },
    { error: null, success: false },
  );

  const resetForm = () => {
    setSelectedCamisetaId(undefined);
    setSelectedTalle(undefined);
    setCantidadToAdd(1);
    setItems([]);
    setFormKey((k) => k + 1);
  };

  const camisetaSeleccionada = useMemo(
    () => listaCamisetas.find((c) => c.id === selectedCamisetaId),
    [listaCamisetas, selectedCamisetaId],
  );

  // Función para saber cuánto stock queda restando lo que ya agregamos al carrito virtual
  const getStockDisponible = (talleBuscado: string) => {
    const stockOriginal =
      camisetaSeleccionada?.stock?.find((s) => s.talle === talleBuscado)
        ?.cantidad || 0;
    const enCarrito = items
      .filter(
        (i) => i.camisetaId === selectedCamisetaId && i.talle === talleBuscado,
      )
      .reduce((acc, curr) => acc + curr.cantidad, 0);
    return stockOriginal - enCarrito;
  };

  const handleAgregarAlCarrito = () => {
    if (
      !selectedCamisetaId ||
      !selectedTalle ||
      cantidadToAdd < 1 ||
      !camisetaSeleccionada
    )
      return;

    const disponible = getStockDisponible(selectedTalle);

    if (cantidadToAdd > disponible) {
      toast.error(
        `Solo quedan ${disponible} unidades disponibles en talle ${selectedTalle}.`,
      );
      return;
    }

    // Buscamos si ya existe el mismo modelo+talle en el carrito para sumarle la cantidad
    const existingIndex = items.findIndex(
      (i) => i.camisetaId === selectedCamisetaId && i.talle === selectedTalle,
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].cantidad += cantidadToAdd;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          camisetaId: selectedCamisetaId,
          equipo: camisetaSeleccionada.equipo,
          temporada: camisetaSeleccionada.temporada,
          talle: selectedTalle,
          cantidad: cantidadToAdd,
          precioUnitario: camisetaSeleccionada.precio,
        },
      ]);
    }

    setSelectedTalle(undefined);
    setCantidadToAdd(1);
  };

  const handleEliminarDelCarrito = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const totalVenta = items.reduce(
    (acc, item) => acc + item.cantidad * item.precioUnitario,
    0,
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white">
          <Plus className="mr-2 h-4 w-4" /> Registrar Venta
        </Button>
      </DialogTrigger>

      {/* Ampliamos el modal para que entre cómodamente el carrito */}
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Venta</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* SECCIÓN 1: AGREGAR AL CARRITO */}
          <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-4">
            <div className="space-y-2">
              <Label>1. Seleccionar Camiseta</Label>
              <Select
                key={`select-cam-${formKey}`}
                value={selectedCamisetaId}
                onValueChange={(val) => {
                  setSelectedCamisetaId(val);
                  setSelectedTalle(undefined);
                }}
                disabled={listaCamisetas.length === 0 || isLoadingStock}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingStock
                        ? "Cargando stock actual..."
                        : listaCamisetas.length === 0
                          ? "No hay stock disponible"
                          : "Busca una camiseta..."
                    }
                  />
                  {isLoadingStock && (
                    <Loader2 className="animate-spin h-4 w-4 ml-2 opacity-50" />
                  )}
                </SelectTrigger>
                <SelectContent className="z-100">
                  {listaCamisetas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.equipo} {c.temporada} ($
                      {c.precio.toLocaleString("es-AR")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>2. Talle</Label>
                <Select
                  key={`select-talle-${selectedCamisetaId}-${formKey}`}
                  value={selectedTalle}
                  onValueChange={setSelectedTalle}
                  disabled={!selectedCamisetaId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent className="z-100">
                    {camisetaSeleccionada?.stock?.map((s) => {
                      const disponible = getStockDisponible(s.talle);
                      return (
                        <SelectItem
                          key={s.id}
                          value={s.talle}
                          disabled={disponible <= 0}
                        >
                          {s.talle}{" "}
                          {disponible > 0
                            ? `(Quedan ${disponible})`
                            : "(Agotado)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad">3. Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidadToAdd}
                  onChange={(e) =>
                    setCantidadToAdd(Number.parseInt(e.target.value) || 1)
                  }
                  disabled={!selectedTalle}
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAgregarAlCarrito}
              className="w-full"
              variant="secondary"
              disabled={!selectedCamisetaId || !selectedTalle}
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Añadir a la lista
            </Button>
          </div>

          {/* SECCIÓN 2: LISTA DE CARRITO Y TOTAL */}
          {items.length > 0 && (
            <div className="space-y-3">
              <Label className="text-muted-foreground uppercase text-xs tracking-wider font-bold">
                Detalle de la venta
              </Label>
              <ScrollArea className="max-h-[180px] pr-3">
                <div className="space-y-2">
                  {items.map((item, dtl) => (
                    <div
                      key={dtl}
                      className="flex justify-between items-center bg-background border border-border p-3 rounded-md shadow-sm"
                    >
                      <div>
                        <p className="font-semibold text-sm leading-none">
                          {item.equipo}{" "}
                          <span className="font-normal text-muted-foreground">
                            ({item.temporada})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Talle:{" "}
                          <span className="font-medium text-foreground">
                            {item.talle}
                          </span>{" "}
                          | Cant:{" "}
                          <span className="font-medium text-foreground">
                            {item.cantidad}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-sm text-primary">
                          $
                          {(item.cantidad * item.precioUnitario).toLocaleString(
                            "es-AR",
                          )}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEliminarDelCarrito(dtl)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-bold text-lg text-foreground">
                  Total Venta
                </span>
                <span className="font-bold text-xl text-green-600 dark:text-green-500">
                  ${totalVenta.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          )}

          {/* FORMULARIO FINAL (Solo contiene el input oculto con el JSON del carrito) */}
          <form action={formAction}>
            <input
              type="hidden"
              name="cart_items"
              value={JSON.stringify(items)}
            />
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isPending || items.length === 0}
            >
              {isPending ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Confirmar Venta"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
