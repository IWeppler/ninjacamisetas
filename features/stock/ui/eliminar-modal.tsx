"use client";

import { useState, useTransition } from "react";
import { eliminarCamisetaAction } from "../actions/eliminar-camiseta";
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
import { Trash2 } from "lucide-react";

interface EliminarCamisetaModalProps {
  id: string;
  equipo: string;
  temporada: string;
}

export function EliminarCamisetaModal({
  id,
  equipo,
  temporada,
}: Readonly<EliminarCamisetaModalProps>) {
  const [isOpen, setIsOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleEliminar = () => {
    startTransition(async () => {
      const result = await eliminarCamisetaAction(id);

      if (result.success) {
        setIsOpen(false);
        toast.success(`La camiseta de ${equipo} ha sido eliminada`);
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
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Eliminar camiseta"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar la camiseta{" "}
            <span className="font-bold">
              {equipo} ({temporada})
            </span>
            . Esta acción borrará también todo su stock actual de forma
            permanente. El historial de ventas de esta camiseta se conservará,
            pero aparecerá como &quot;Producto eliminado&quot;.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          {/* Usamos un Button normal en lugar de AlertDialogAction para poder controlar el estado disabled/loading */}
          <Button
            variant="destructive"
            onClick={handleEliminar}
            disabled={isPending}
          >
            {isPending ? "Eliminando..." : "Sí, eliminar camiseta"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
