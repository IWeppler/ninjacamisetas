import { getPublicCatalogAction } from "@/features/store/actions/store-actions";
import { StoreCatalog } from "@/features/store/components/store-catalog";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const { data: camisetas, error } = await getPublicCatalogAction();

  return (
    <div className="min-h-screen bg-[#fffefe] flex flex-col">
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
          />
        )}
      </main>

    </div>
  );
}
