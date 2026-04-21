import { getCamisetasAction } from "@/features/stock/actions/stock";
import { StockView } from "@/features/stock/ui/stock-view";

export default async function StockPage() {
  const { data: camisetas } = await getCamisetasAction();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inventario de camisetas
          </h1>
          <p className="text-muted-foreground mt-1">
            Acá podés gestionar el stock de las camisetas.
          </p>
        </div>
      </div>
      <StockView camisetas={camisetas || []} />
    </div>
  );
}
