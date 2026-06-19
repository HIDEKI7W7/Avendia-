import { NextRequest, NextResponse } from "next/server";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIDDLEWARE RBAC — AVENDIA · Capa de seguridad perimetral (Edge Runtime)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ARQUITECTURA DE COOKIES (el Edge Runtime no puede leer localStorage):
 *   • `avendia_session=1`    → Usuario autenticado
 *   • `avendia_role=ADMIN|DOCENTE` → Rol del usuario
 *
 * El cliente escribe estas cookies en el momento del login (login/page.tsx)
 * y las borra en el logout (admin/layout.tsx y dashboard/layout.tsx).
 *
 * REGLAS DE DESPACHO:
 *
 *  1. /login  + sesión activa  → Redirigir al panel correcto según rol
 *  2. /dashboard/admin/*  sin sesión   → /login
 *  3. /dashboard/admin/*  con DOCENTE  → /dashboard  (acceso denegado)
 *  4. /dashboard/*        sin sesión   → /login
 *  5. Cualquier otro caso              → pasar al siguiente handler
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const role       = request.cookies.get("avendia_role")?.value ?? "";
  const hasSession = request.cookies.get("avendia_session")?.value === "1";

  const isAdmin    = role === "ADMIN";
  const isDocente  = !isAdmin; // cualquier cosa que no sea ADMIN es tratada como docente

  // ── 1. Usuario ya autenticado intenta ir a /login ───────────────────────
  if (pathname === "/login" && hasSession) {
    const dest = isAdmin ? "/dashboard/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── 2-3. Protección del perímetro /dashboard/admin/* ────────────────────
  if (pathname.startsWith("/dashboard/admin")) {
    // Sin sesión → login
    if (!hasSession) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);  // para redirigir tras login
      return NextResponse.redirect(url);
    }

    // Con sesión pero rol DOCENTE → bloqueado, volver al dashboard de docente
    if (isDocente) {
      console.warn(
        `[RBAC-MIDDLEWARE] Acceso bloqueado: rol="${role}" intentó acceder a ${pathname}`
      );
      const url = new URL("/dashboard", request.url);
      url.searchParams.set("acceso", "denegado");
      return NextResponse.redirect(url);
    }

    // ADMIN autorizado → dejar pasar
    return NextResponse.next();
  }

  // ── 4. Protección genérica de /dashboard/* ──────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!hasSession) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // ADMIN en el dashboard de docente → redirigir al panel admin
    if (isAdmin && pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
  }

  // ── 5. Pasar al siguiente handler (ruta pública o ya autorizada) ─────────
  return NextResponse.next();
}

/**
 * Selector de rutas: activar el middleware SOLO en las rutas relevantes.
 * Se excluyen explícitamente _next (assets), api, y archivos estáticos.
 */
export const config = {
  matcher: [
    "/login",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
