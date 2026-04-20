import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { FilterX, Search, ArrowUpDown } from "lucide-react";
import { TALLE_OPTIONS, TIPO_OPTIONS } from "@/entities/camisetas/constants";
import { SelectOption } from "@/shared/types/select";

const CATEGORIAS_SIMPLIFICADAS = [
  { value: "todas", label: "Todas las categorías" },
  { value: "2025/2026", label: "25/26" },
  { value: "otras", label: "Otras temporadas" },
  { value: "especiales", label: "Especiales" },
  { value: "retro", label: "Retro" },
];

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  temporada: string;
  onTemporadaChange: (value: string) => void;

  tipo: string;
  onTipoChange: (value: string) => void;

  talle: string;
  onTalleChange: (value: string) => void;

  orden: string;
  onOrdenChange: (value: string) => void;
  ordenOptions: SelectOption[];

  onLimpiar: () => void;
  hayFiltrosActivos: boolean;

  actionButtons?: React.ReactNode;
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  temporada,
  onTemporadaChange,
  orden,
  tipo,
  onTipoChange,
  talle,
  onTalleChange,
  onOrdenChange,
  ordenOptions,
  onLimpiar,
  hayFiltrosActivos,
  actionButtons,
}: Readonly<FilterToolbarProps>) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-2 bg-[#f5f4f4] border border-border/60">
      {/* Buscador principal */}
      <div className="relative flex-1 min-w-[200px] w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full rounded-none shadow-none border-border/60 bg-white hover:border-foreground/40 focus-visible:border-foreground focus-visible:ring-0 transition-colors h-11"
        />
      </div>

      {/* Select de Temporada/Categoría */}
      <Select
        value={temporada === "" ? "todas" : temporada}
        onValueChange={(val) => onTemporadaChange(val === "todas" ? "" : val)}
      >
        <SelectTrigger className="w-full sm:w-[180px] rounded-none shadow-none cursor-pointer border-border/60 hover:border-foreground/40 bg-white focus:ring-0 transition-colors">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent className="rounded-none shadow-md">
          {CATEGORIAS_SIMPLIFICADAS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer rounded-none"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Select de Tipo */}
      <Select value={tipo} onValueChange={onTipoChange}>
        <SelectTrigger className="w-full sm:w-[180px] rounded-none shadow-none cursor-pointer border-border/60 hover:border-foreground/40 bg-white focus:ring-0 transition-colors">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent className="rounded-none shadow-md">
          {TIPO_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer rounded-none"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Select de Talle */}
      <Select value={talle} onValueChange={onTalleChange}>
        <SelectTrigger className="w-full sm:w-[160px] rounded-none shadow-none cursor-pointer border-border/60 hover:border-foreground/40 bg-white focus:ring-0 transition-colors">
          <SelectValue placeholder="Talle" />
        </SelectTrigger>
        <SelectContent className="rounded-none shadow-md">
          {TALLE_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer rounded-none uppercase"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Select de Orden */}
      <Select value={orden} onValueChange={onOrdenChange}>
        <SelectTrigger className="w-full sm:w-[240px] rounded-none shadow-none cursor-pointer border-border/60 hover:border-foreground/40 bg-white focus:ring-0 transition-colors">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3 w-3 opacity-50" />
            <SelectValue placeholder="Ordenar por" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-none shadow-md">
          {ordenOptions.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer rounded-none"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Botón de Limpiar (Solo si hay filtros activos) */}
      {hayFiltrosActivos && (
        <Button
          variant="ghost"
          onClick={onLimpiar}
          className="text-muted-foreground hover:text-foreground w-full sm:w-auto rounded-none cursor-pointer uppercase tracking-widest text-xs font-semibold hover:bg-muted/50"
        >
          <FilterX className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      )}

      {/* Botones de Acción Extra (Empujados a la derecha si hay espacio) */}
      {actionButtons && (
        <div className="flex items-center gap-2 w-full sm:w-auto xl:ml-auto">
          {actionButtons}
        </div>
      )}
    </div>
  );
}
