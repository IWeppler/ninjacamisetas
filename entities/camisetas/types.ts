export interface CamisetaStock {
  id: string;
  talle: string;
  cantidad: number;
}

export interface Camiseta {
  id: string;
  equipo: string;
  temporada: string;
  tipo: string;
  precio: number;
  precio_costo: number;
  imagen_url: string | null;
  creado_en: string;
  publicado: boolean;
  slug: string | null;
  stock?: CamisetaStock[];
}
