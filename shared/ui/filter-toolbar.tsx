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
import {
  TALLE_OPTIONS,
  TIPO_OPTIONS,
  TEMPORADA_OPTIONS,
} from "@/entities/camisetas/constants";
import { SelectOption } from "@/shared/types/select";

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
    <div className="flex flex-col space-y-3 bg-card p-3 rounded-lg border border-border">
      {/* Fila superior: Buscador principal y Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Renderizamos los botones si existen */}
        {actionButtons && (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {actionButtons}
          </div>
        )}
      </div>

      {/* Fila inferior: Filtros detallados y Ordenamiento */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {/* Ampliamos de 150px a 180px */}
        <Select value={temporada} onValueChange={onTemporadaChange}>
          <SelectTrigger className="w-full sm:w-[180px] ">
            <SelectValue placeholder="Temporada" />
          </SelectTrigger>
          <SelectContent>
            {TEMPORADA_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ampliamos de 160px a 180px */}
        <Select value={tipo} onValueChange={onTipoChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={talle} onValueChange={onTalleChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Talle" />
          </SelectTrigger>
          <SelectContent>
            {TALLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={orden} onValueChange={onOrdenChange}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 opacity-50" />
              <SelectValue placeholder="Ordenar por" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {ordenOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hayFiltrosActivos && (
          <Button
            variant="ghost"
            onClick={onLimpiar}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
          >
            <FilterX className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
