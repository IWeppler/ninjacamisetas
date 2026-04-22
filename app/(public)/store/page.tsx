import { getProductosAction } from "@/features/store/actions/store-actions";
import { StoreCatalog } from "@/features/store/components/store-catalog";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const { data: productos, error } = await getProductosAction();

  return (
    <div className="min-h-screen bg-[#fffefe] flex flex-col">
      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Catálogo Oficial
          </h1>
          <p className="text-md text-muted-foreground max-w-2xl">
            Encontrá la camiseta de tu equipo. Stock limitado.
          </p>
        </div>

        {error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            Ocurrió un error al cargar el catálogo. Por favor, intenta
            nuevamente más tarde.
          </div>
        ) : (
          <StoreCatalog productos={productos || []} />
        )}
      </main>
    </div>
  );
}
