"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/actions/logout";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Inventario", href: "/stock", icon: Package },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 sticky top-0 md:h-screen">
      {/* BRANDING */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white shrink-0">
          <Image
            src="/ninja-logo.jpg"
            alt="Logo Ninja Camisetas"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
        <span className="font-bold text-lg text-gray-900 tracking-tight">
          Ninja Camisetas
        </span>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
                isActive
                  ? "bg-neutral-200 text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-neurtal-900" : "text-neutral-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => logoutAction()}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer font-medium"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
