"use client";

import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { FilterX, ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { TALLE_OPTIONS, TIPO_OPTIONS } from "@/entities/productos/constants";
import { SelectOption } from "@/shared/types/select";
import { useState } from "react";

// Categorías limpias y con sentido comercial
const CATEGORIAS_SIMPLIFICADAS = [
  { value: "todas", label: "Todas las categorías" },
  { value: "actual", label: "Temporada Actual" },
  { value: "otras", label: "Otras temporadas" },
  { value: "retro", label: "Retro / Históricas" },
];

interface FilterToolbarProps {
  categoria: string;
  onCategoriaChange: (value: string) => void;
  tipo: string;
  onTipoChange: (value: string) => void;
  variante: string;
  onVarianteChange: (value: string) => void;
  orden: string;
  onOrdenChange: (value: string) => void;
  ordenOptions: SelectOption[];
  onLimpiar: () => void;
  hayFiltrosActivos: boolean;
  actionButtons?: React.ReactNode;
}

export function FilterToolbar({
  categoria,
  onCategoriaChange,
  orden,
  tipo,
  onTipoChange,
  variante,
  onVarianteChange,
  onOrdenChange,
  ordenOptions,
  onLimpiar,
  hayFiltrosActivos,
  actionButtons,
}: Readonly<FilterToolbarProps>) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const tiposUISinRetro = TIPO_OPTIONS.filter((t) => t.value !== "retro");

  const isTipoDisabled = categoria === "retro";

  return (
    <div className="space-y-4 mb-4">
    
      {/* MOBILE TOOLBAR */}
      <div className="flex flex-col sm:hidden w-full border border-border bg-white shadow-sm overflow-hidden rounded-md">
        {actionButtons && (
          <div className="flex items-center justify-center p-2 border-b border-border bg-white">
            {actionButtons}
          </div>
        )}

        {/* Dos botones Flat (Filtros y Ordenar) */}
        <div className="grid grid-cols-2 divide-x divide-border">
          <Dialog
            open={isMobileFiltersOpen}
            onOpenChange={setIsMobileFiltersOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 rounded-none border-0 uppercase tracking-widest text-xs font-semibold text-foreground hover:bg-muted/30 focus-visible:ring-0 flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {hayFiltrosActivos && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Button>
            </DialogTrigger>

            <DialogContent className="fixed inset-0 z-50 w-screen h-dvh max-w-none translate-x-0! !translate-y-0! top-0! left-0! m-0 p-0 rounded-none border-none bg-white flex flex-col overflow-hidden [&>button]:hidden">
              <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between shadow-none space-y-0">
                <DialogTitle className="uppercase tracking-widest text-sm font-semibold m-0">
                  Filtros del Catálogo
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="rounded-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </Button>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="uppercase tracking-widest text-[10px] text-muted-foreground font-semibold">
                    Categoría
                  </Label>
                  <Select
                    value={categoria === "" ? "todas" : categoria}
                    onValueChange={(val) =>
                      onCategoriaChange(val === "todas" ? "" : val)
                    }
                  >
                    <SelectTrigger className="w-full h-12 rounded-none bg-[#f5f4f4] border-0 shadow-none uppercase tracking-widest text-xs font-semibold focus:ring-0">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border shadow-xl">
                      {CATEGORIAS_SIMPLIFICADAS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="rounded-none uppercase tracking-widest text-xs py-3"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="uppercase tracking-widest text-[10px] text-muted-foreground font-semibold">
                    Tipo {isTipoDisabled && "(Retro seleccionado)"}
                  </Label>
                  <Select
                    value={tipo}
                    onValueChange={onTipoChange}
                    disabled={isTipoDisabled}
                  >
                    <SelectTrigger className="w-full h-12 rounded-none bg-[#f5f4f4] border-0 shadow-none uppercase tracking-widest text-xs font-semibold focus:ring-0 disabled:opacity-50">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border shadow-xl">
                      {tiposUISinRetro.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="rounded-none uppercase tracking-widest text-xs py-3"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="uppercase tracking-widest text-[10px] text-muted-foreground font-semibold">
                    Talle
                  </Label>
                  <Select value={variante} onValueChange={onVarianteChange}>
                    <SelectTrigger className="w-full h-12 rounded-none bg-[#f5f4f4] border-0 shadow-none uppercase tracking-widest text-xs font-semibold focus:ring-0">
                      <SelectValue placeholder="Talle" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border shadow-xl">
                      {TALLE_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="rounded-none uppercase tracking-widest text-xs py-3"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 border-t border-border flex gap-3 bg-white">
                <Button
                  variant="outline"
                  onClick={() => {
                    onLimpiar();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="flex-1 rounded-none uppercase tracking-widest text-xs font-semibold h-12 border-border shadow-none"
                >
                  Limpiar
                </Button>
                <Button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 rounded-none uppercase tracking-widest text-xs font-semibold h-12 shadow-none"
                >
                  Ver Resultados
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Select value={orden} onValueChange={onOrdenChange}>
            <SelectTrigger className="flex-1 h-12 rounded-none border-0 shadow-none uppercase tracking-widest text-xs font-semibold text-foreground focus:ring-0 bg-transparent flex items-center justify-center [&>svg]:hidden px-0">
              <div className="flex items-center justify-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <span>Ordenar</span>
              </div>
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={4}
              className="w-[200px] rounded-none border-border shadow-xl"
            >
              {ordenOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-none uppercase tracking-widest text-xs py-3"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DESKTOP TOOLBAR */}
      <div className="hidden sm:flex flex-wrap items-center justify-between py-3 border-b border-border bg-white mb-6">
        {/* Lado Izquierdo: Filtros */}
        <div className="flex items-center gap-3 pl-2">
          <span className="uppercase tracking-widest text-[10px] font-semibold text-muted-foreground mr-1">
            Filtros:
          </span>

          <Select
            value={categoria === "" ? "todas" : categoria}
            onValueChange={(val) =>
              onCategoriaChange(val === "todas" ? "" : val)
            }
          >
            <SelectTrigger className="w-auto min-w-[170px] rounded-none shadow-none cursor-pointer border-0 bg-[#f5f4f4] focus:ring-0 transition-colors text-[11px] uppercase tracking-widest font-semibold h-10 px-4">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="rounded-none shadow-md">
              {CATEGORIAS_SIMPLIFICADAS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer rounded-none uppercase tracking-widest text-[11px] py-2.5"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={tipo}
            onValueChange={onTipoChange}
            disabled={isTipoDisabled}
          >
            <SelectTrigger className="w-auto min-w-[130px] rounded-none shadow-none cursor-pointer border-0 bg-[#f5f4f4] focus:ring-0 transition-colors text-[11px] uppercase tracking-widest font-semibold h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue placeholder={isTipoDisabled ? "Retro" : "Tipo"} />
            </SelectTrigger>
            <SelectContent className="rounded-none shadow-md">
              {tiposUISinRetro.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer rounded-none uppercase tracking-widest text-[11px] py-2.5"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={variante} onValueChange={onVarianteChange}>
            <SelectTrigger className="w-auto min-w-[120px] rounded-none shadow-none cursor-pointer border-0 bg-[#f5f4f4] focus:ring-0 transition-colors text-[11px] uppercase tracking-widest font-semibold h-10 px-4">
              <SelectValue placeholder="Talle" />
            </SelectTrigger>
            <SelectContent className="rounded-none shadow-md">
              {TALLE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer rounded-none uppercase tracking-widest text-[11px] py-2.5"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hayFiltrosActivos && (
            <Button
              variant="ghost"
              onClick={onLimpiar}
              className="text-muted-foreground hover:text-foreground rounded-none cursor-pointer uppercase tracking-widest text-[10px] font-semibold hover:bg-muted/50 h-10 px-3 ml-1"
            >
              <FilterX className="h-3 w-3 mr-1.5" /> Limpiar
            </Button>
          )}
        </div>

        {/* Lado Derecho: Ordenar & Acciones */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="uppercase tracking-widest text-[10px] font-semibold text-muted-foreground mr-1">
            Ordenar:
          </span>

          <Select value={orden} onValueChange={onOrdenChange}>
            <SelectTrigger className="w-auto min-w-[190px] rounded-none shadow-none cursor-pointer border-0 bg-[#f5f4f4] focus:ring-0 transition-colors text-[11px] uppercase tracking-widest font-semibold h-10 px-4">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="rounded-none shadow-md">
              {ordenOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer rounded-none uppercase tracking-widest text-[11px] py-2.5"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {actionButtons && (
            <div className="flex items-center ml-2 border-l border-border pl-4">
              {actionButtons}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
