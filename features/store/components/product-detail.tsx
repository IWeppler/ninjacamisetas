"use client";

import { useState } from "react";
import { Camiseta } from "@/entities/camisetas/types";
import {
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { TALLE_OPTIONS } from "@/entities/camisetas/constants";
import { useCartStore } from "@/features/store/store/useCartStore";
import { toast } from "sonner";

interface ProductDetailProps {
  camiseta: Camiseta;
}

export function ProductDetail({ camiseta }: Readonly<ProductDetailProps>) {
  const [talleSeleccionado, setTalleSeleccionado] = useState<string | null>(
    null,
  );
  const [errorTalle, setErrorTalle] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Traemos la función para agregar al carrito desde Zustand
  const addItem = useCartStore((state) => state.addItem);

  // --- Procesamiento de todas las imágenes ---
  let imagenes: string[] = [];
  if (Array.isArray(camiseta.imagen_url)) {
    imagenes = camiseta.imagen_url;
  } else if (typeof camiseta.imagen_url === "string") {
    try {
      const parsed = JSON.parse(camiseta.imagen_url);
      imagenes = Array.isArray(parsed) ? parsed : [camiseta.imagen_url];
    } catch {
      imagenes = [camiseta.imagen_url];
    }
  }

  // Stock disponible
  const stockTotal =
    camiseta.stock?.reduce((acc, s) => acc + s.cantidad, 0) || 0;
  const estaAgotado = stockTotal === 0;

  // --- Handlers de Galería ---
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imagenes.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imagenes.length - 1 ? 0 : prev + 1,
    );
  };

  // --- NUEVO: Manejador del Carrito ---
  const handleAddToCart = () => {
    if (estaAgotado) return;

    if (!talleSeleccionado) {
      setErrorTalle(true);
      return;
    }
    setErrorTalle(false);

    // Buscamos el stock máximo disponible para este talle exacto
    const stockDeTalle = camiseta.stock?.find(
      (s) => s.talle.toLowerCase() === talleSeleccionado.toLowerCase(),
    );
    const stockMaximo = stockDeTalle ? stockDeTalle.cantidad : 0;

    if (stockMaximo <= 0) {
      toast.error("Este talle se encuentra agotado.");
      return;
    }

    // Agregamos a Zustand (esto también abrirá el Sidebar automáticamente)
    addItem({
      camisetaId: camiseta.id,
      equipo: camiseta.equipo,
      temporada: camiseta.temporada,
      tipo: camiseta.tipo,
      talle: talleSeleccionado,
      precio: camiseta.precio,
      cantidad: 1, // Por defecto sumamos 1
      imagenUrl: imagenes[0] || null,
      stockMaximo: stockMaximo,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Botón de volver ultra minimalista */}
      <div className="mb-8">
        <Link
          href="/store"
          className="inline-flex items-center text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
        {/* COLUMNA IZQUIERDA: Galería Interactiva */}
        <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col gap-4">
          {/* Imagen Principal */}
          <div className="relative aspect-4/4 bg-[#f7f7f7] w-full flex items-center justify-center group overflow-hidden border border-border/40">
            {imagenes.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagenes[currentImageIndex]}
                alt={`${camiseta.equipo} - Vista ${currentImageIndex + 1}`}
                className="object-cover w-full h-full transition-opacity duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                <ShoppingBag className="w-20 h-20 mb-4" strokeWidth={1} />
                <span className="text-sm font-medium uppercase tracking-widest">
                  Sin imagen
                </span>
              </div>
            )}

            {/* Flechas de Navegación */}
            {imagenes.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-foreground flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm border border-border/50 cursor-pointer"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-foreground flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm border border-border/50 cursor-pointer"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          {/* Miniaturas (Thumbnails) */}
          {imagenes.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {imagenes.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 bg-[#f7f7f7] transition-all border-2 cursor-pointer ${
                    currentImageIndex === index
                      ? "border-foreground opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100 hover:border-border"
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Miniatura ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Checkout Pegajoso (Sticky) */}
        <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col sticky top-24">
          {/* Encabezado del Producto */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                {camiseta.temporada}
              </span>
              {camiseta.tipo && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    {camiseta.tipo}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground uppercase tracking-tight leading-none mb-4">
              {camiseta.equipo}
            </h1>

            <div className="text-xl font-medium text-foreground">
              ${camiseta.precio.toLocaleString("es-AR")}
            </div>
          </div>

          <div className="w-full h-px bg-border/60 mb-8"></div>

          {/* Selector de Talles */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Selecciona un talle
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {TALLE_OPTIONS.filter((o) => o.value !== "todos").map(
                (talleOpt) => {
                  const stockDeTalle = camiseta.stock?.find(
                    (s) =>
                      s.talle.toLowerCase() === talleOpt.value.toLowerCase(),
                  );
                  const tieneStock = stockDeTalle && stockDeTalle.cantidad > 0;
                  const isSelected = talleSeleccionado === talleOpt.value;

                  return (
                    <button
                      key={talleOpt.value}
                      type="button"
                      disabled={!tieneStock}
                      onClick={() => {
                        setTalleSeleccionado(talleOpt.value);
                        setErrorTalle(false);
                      }}
                      className={`
                      py-3 rounded-none border text-sm font-semibold uppercase transition-all
                      ${
                        isSelected
                          ? "border-foreground bg-foreground text-background cursor-pointer"
                          : tieneStock
                            ? "border-border bg-transparent text-foreground hover:border-foreground/40 cursor-pointer"
                            : "border-border/40 bg-transparent text-muted-foreground opacity-40 cursor-not-allowed line-through"
                      }
                    `}
                    >
                      {talleOpt.value}
                    </button>
                  );
                },
              )}
            </div>

            {errorTalle && (
              <p className="text-destructive text-xs font-semibold tracking-wide flex items-center mt-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                Selecciona un talle para continuar
              </p>
            )}
          </div>

          {/* Call To Action Flat */}
          <div className="mt-4">
            <button
              onClick={handleAddToCart}
              disabled={estaAgotado}
              className={`
                w-full flex items-center justify-center gap-3 py-4 px-6 rounded-none font-bold text-sm uppercase tracking-widest transition-colors cursor-pointer
                ${
                  estaAgotado
                    ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                    : "bg-foreground hover:bg-foreground/90 text-background"
                }
              `}
            >
              <ShoppingCart className="w-5 h-5" />
              {estaAgotado ? "Agotado" : "Añadir al carrito"}
            </button>

            {!estaAgotado && (
              <p className="text-center text-[11px] uppercase tracking-wide font-medium text-muted-foreground mt-4 leading-relaxed">
                El pago y envío se coordinan <br /> de forma segura por WhatsApp
                al finalizar.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
