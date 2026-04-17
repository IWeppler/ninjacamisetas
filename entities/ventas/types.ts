export interface Venta {
  id: string;
  camiseta_id: string | null;
  talle: string;
  cantidad: number;
  precio_unitario: number;
  precio_costo: number;
  total: number;
  fecha_venta: string;

  camiseta?: {
    equipo: string;
    temporada: string;
    imagen_url: string | null;
    tipo?: string;
  } | null;
}
