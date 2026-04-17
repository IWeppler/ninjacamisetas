"use client";

import { useState, useActionState } from "react";
import { editarCamisetaAction } from "../actions/editar-camiseta";
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
import { Pencil, ImagePlus } from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  TIPO_OPTIONS,
  TALLE_OPTIONS,
  TEMPORADA_OPTIONS,
} from "@/entities/camisetas/constants";

interface EditarCamisetaModalProps {
  camiseta: Camiseta;
}

export function EditarCamisetaModal({
  camiseta,
}: Readonly<EditarCamisetaModalProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [archivos, setArchivos] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files));
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setArchivos([]);
    }
  };

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: { error: string | null; success: boolean },
      formData: FormData,
    ) => {
      const result = await editarCamisetaAction(prevState, formData);

      if (result.success) {
        setIsOpen(false);
        setArchivos([]);
        toast.success("Camiseta actualizada correctamente");
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    { error: null, success: false },
  );

  // Función para obtener el stock actual de un talle específico
  const getStockParaTalle = (talleBuscado: string) => {
    const stockTalle = camiseta.stock?.find(
      (s) => s.talle.toLowerCase() === talleBuscado.toLowerCase(),
    );
    return stockTalle ? stockTalle.cantidad : 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-muted-foreground/80 hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
          title="Editar camiseta"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Camiseta</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form action={formAction} className="space-y-6 mt-4 px-1 pb-2">
            {/* Input oculto con el ID de la camiseta para el Server Action */}
            <input type="hidden" name="id" value={camiseta.id} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipo">Equipo</Label>
                <Input
                  id="equipo"
                  name="equipo"
                  defaultValue={camiseta.equipo}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temporada">Temporada</Label>
                <Select name="temporada" defaultValue={camiseta.temporada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona temporada..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPORADA_OPTIONS.filter(
                      (opt) => opt.value !== "todos",
                    ).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select name="tipo" defaultValue={camiseta.tipo.toLowerCase()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_OPTIONS.filter((opt) => opt.value !== "todos").map(
                      (opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio_costo">Precio de Costo (ARS)</Label>
                <Input
                  id="precio_costo"
                  name="precio_costo"
                  type="number"
                  min="0"
                  step="100"
                  defaultValue={camiseta.precio_costo || 0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio de Venta (ARS)</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  min="0"
                  step="100"
                  defaultValue={camiseta.precio}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Reemplazar Imágenes (Opcional)</Label>
              <div className="flex flex-col items-center justify-center w-full">
                <Label
                  htmlFor={`imagenes-edit-${camiseta.id}`}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <ImagePlus className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-1 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">
                        Haz clic para subir
                      </span>{" "}
                      o arrastra tus fotos aquí
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Si subes nuevas fotos, reemplazarán a las actuales.
                    </p>
                  </div>
                  <Input
                    id={`imagenes-edit-${camiseta.id}`}
                    name="imagenes"
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>

              {archivos.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {archivos.map((file, index) => (
                    <div
                      key={index}
                      className="relative w-16 h-16 rounded-md overflow-hidden border border-border bg-muted group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium mb-3">
                Actualizar Stock por Talle
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {TALLE_OPTIONS.filter((opt) => opt.value !== "todos").map(
                  (opt) => (
                    <div
                      key={opt.value}
                      className="flex flex-col items-center space-y-1"
                    >
                      <Label
                        htmlFor={`stock_edit_${camiseta.id}_${opt.value}`}
                        className="text-xs text-muted-foreground"
                      >
                        {opt.label}
                      </Label>
                      <Input
                        id={`stock_edit_${camiseta.id}_${opt.value}`}
                        name={`stock_${opt.value}`}
                        type="number"
                        min="0"
                        defaultValue={getStockParaTalle(opt.value)}
                        className="text-center px-1"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Actualizando..." : "Guardar Cambios"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
