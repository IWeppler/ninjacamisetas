import Link from "next/link";
import Image from "next/image";
import { CartButton } from "@/features/store/ui/cart-button";

export function PublicNavbar() {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/store"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-none overflow-hidden bg-black text-white">
            <Image
              src="/ninja-logo.jpg"
              alt="Ninja Camisetas"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <span className="font-black text-xl tracking-tight hidden sm:block uppercase">
            Ninja Camisetas
          </span>
        </Link>

        <CartButton />
      </div>
    </header>
  );
}
