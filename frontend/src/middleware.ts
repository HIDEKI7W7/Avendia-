import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware de Next.js — Guardián de rutas RBAC.
 *
 * Funciona en el Edge Runtime (sin acceso a localStorage).
 * El token JWT se almacena en localStorage en el cliente, por lo que el
 * middleware no puede leerlo directamente. En su lugar usamos una cookie
 * `avendia_role` que el cliente escribe en el momento del login, y que
 * este middleware lee para tomar la decisión de redirección.
 *
 * Flujo:
 *  1. El cliente escribe la cookie `avendia_role` al hacer login.
 *  2. Este middleware intercepta cada navegación.
 *  3. Si la ruta empieza con /dashboard/admin y el rol NO es ADMIN → redirige a /dashboard.
 *  4. Si la ruta empieza con /dashboard y no hay cookie → redirige a /login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Leer la cookie de rol escrita por el cliente en el momento del login
  const role = request.cookies.get("avendia_role")?.value;
  const hasSession = request.cookies.get("avendia_session")?.value === "1";

  // ── Proteger cualquier ruta bajo /dashboard ─────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    // Sin sesión activa → redirigir al login
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Ruta de administrador → solo ADMIN
    if (pathname.startsWith("/dashboard/admin")) {
      if (role !== "ADMIN") {
        console.warn(
          `[RBAC] Acceso denegado: usuario con rol "${role}" intentó acceder a ${pathname}`
        );
        // Redirigir al dashboard del docente con un indicador de acceso denegado
        const deniedUrl = new URL("/dashboard?acceso=denegado", request.url);
        return NextResponse.redirect(deniedUrl);
      }
    }
  }

  // ── Redirigir a los usuarios ya autenticados que visiten /login ─────────
  if (pathname === "/login" && hasSession) {
    const dest = role === "ADMIN" ? "/dashboard/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

// Activar el middleware solo en las rutas relevantes
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
