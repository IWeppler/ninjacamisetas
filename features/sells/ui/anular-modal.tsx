"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { anularVentaAction } from "../actions/anular-venta";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { RotateCcw } from "lucide-react";

interface AnularVentaModalProps {
  id: string;
  productoNombre: string;
  cantidad: number;
  variante: string;
  isProductoEliminado: boolean;
}

export function AnularVentaModal({
  id,
  productoNombre,
  cantidad,
  variante,
  isProductoEliminado,
}: Readonly<AnularVentaModalProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAnular = () => {
    startTransition(async () => {
      const result = await anularVentaAction(id);

      if (result.success) {
        setIsOpen(false);
        if (isProductoEliminado) {
          toast.success("Venta anulada correctamente. (Stock no restaurado)");
        } else {
          toast.success(
            `Venta anulada. Se han devuelto ${cantidad} unidad(es) de talle ${variante} al stock.`,
          );
        }

        router.refresh();
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer"
          title="Anular venta"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Anular</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Anular esta venta?</AlertDialogTitle>
          {/* 💡 FIX: Usamos span en lugar de p para evitar el error de hidratación */}
          <AlertDialogDescription className="text-sm">
            <span>
              Estás a punto de anular la venta de{" "}
              <span className="font-bold text-foreground">
                {cantidad}x {productoNombre} (Talle {variante})
              </span>
              .
            </span>
            <br />
            <br />
            {isProductoEliminado ? (
              <span className="text-destructive font-medium">
                Nota: El producto original ha sido eliminado del sistema. La
                venta se borrará del historial, pero no se puede restaurar el
                stock.
              </span>
            ) : (
              <span>
                El registro se eliminará del historial y el stock volverá
                automáticamente al inventario.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleAnular}
            disabled={isPending}
          >
            {isPending ? "Anulando..." : "Sí, anular venta"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
