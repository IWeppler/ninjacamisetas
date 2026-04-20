import { getPublicCatalogAction } from "@/features/store/actions/store-actions";
import { StoreCatalog } from "@/features/store/components/store-catalog";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const { data: camisetas, error } = await getPublicCatalogAction();

  const NUMERO_WHATSAPP = "5491137920744";

  return (
    <div className="min-h-screen bg-[#fffefe] flex flex-col">
      {/* HEADER PÚBLICO SIMPLE */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden bg-black text-white">
              {/* Usamos el logo que ya tienes */}
              <Image
                src="/ninja-logo.jpg"
                alt="Ninja Camisetas"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <span className="font-black text-xl tracking-tight">
              NINJA CAMISETAS
            </span>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Catálogo Oficial
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Encontrá la camiseta de tu equipo. Stock limitado.
          </p>
        </div>

        {error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            Ocurrió un error al cargar el catálogo. Por favor, intenta
            nuevamente más tarde.
          </div>
        ) : (
          <StoreCatalog
            camisetas={camisetas || []}
            numeroWhatsApp={NUMERO_WHATSAPP}
          />
        )}
      </main>

      {/* FOOTER BÁSICO */}
      <footer className="bg-white border-t border-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ninja Camisetas. Todos los derechos
          reservados.
        </div>
      </footer>
    </div>
  );
}
