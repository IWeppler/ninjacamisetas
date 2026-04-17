import { getCamisetasAction } from "@/features/stock/actions/stock";
import { StockView } from "@/features/stock/ui/stock-view";

export default async function StockPage() {
  const { data: camisetas } = await getCamisetasAction();

  return <StockView camisetas={camisetas || []} />;
}
