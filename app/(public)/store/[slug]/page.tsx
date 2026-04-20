import { getCamisetaBySlugAction } from "@/features/store/actions/store-actions";
import { ProductDetail } from "@/features/store/components/product-detail";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CamisetaPage({ params }: Readonly<PageProps>) {
  const { slug } = await params;

  const { data: camiseta, error } = await getCamisetaBySlugAction(slug);

  if (error || !camiseta) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const NUMERO_WHATSAPP = "5491137920744"; // El número real de tu primo

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER COMPARTIDO (Podrías extraerlo a un Layout luego) */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/store"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden bg-black text-white">
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
          </Link>
        </div>
      </header>

      {/* CONTENIDO DEL PRODUCTO */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
        <ProductDetail
          camiseta={camiseta}
          numeroWhatsApp={NUMERO_WHATSAPP}
          baseUrl={baseUrl}
        />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ninja Camisetas. Todos los derechos
          reservados.
        </div>
      </footer>
    </div>
  );
}
