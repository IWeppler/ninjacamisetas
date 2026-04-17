import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Creamos una respuesta inicial que iremos modificando si cambian las cookies
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Actualizamos las cookies en la petición actual
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );

        // Actualizamos la respuesta para que el navegador guarde las nuevas cookies
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Obtenemos el usuario actual de forma segura
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  // Si NO hay usuario y la ruta NO es /auth -> Redirigir a /auth
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Si SÍ hay usuario y trata de ir a /auth -> Redirigir al inicio (Dashboard)
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Si todo está bien, permitimos que la petición continúe
  return supabaseResponse;
}

// Configuración de rutas donde se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Ignora las rutas internas de Next.js y archivos estáticos:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico (ícono)
     * - extensiones de imágenes comunes (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
