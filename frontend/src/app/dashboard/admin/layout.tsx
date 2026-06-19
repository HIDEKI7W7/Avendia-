"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════
const IcoChart = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IcoUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoBook = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const IcoReport = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IcoSupport = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcoConfig = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
  </svg>
);
const IcoBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// NAV CONFIG
// ═══════════════════════════════════════════════════════════════════════════
interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  tag?: string;
  tagColor?: string;
  alert?: number;
}

const NAV: NavItem[] = [
  { label: "Dashboard",         icon: <IcoChart />,   href: "/dashboard/admin" },
  { label: "Usuarios",          icon: <IcoUsers />,   href: "/dashboard/admin/users" },
  { label: "Biblioteca Global", icon: <IcoBook />,    href: "#", tag: "IA", tagColor: "bg-violet-100 text-violet-700" },
  { label: "Reportes",          icon: <IcoReport />,  href: "#" },
  { label: "Soporte",           icon: <IcoSupport />, href: "#", alert: 5 },
  { label: "Configuración",     icon: <IcoConfig />,  href: "#" },
];

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [adminName,  setAdminName]  = useState("Administrador");
  const [adminEmail, setAdminEmail] = useState("admin@avendia.edu");
  const [notifOpen,  setNotifOpen]  = useState(false);

  // ── Guardia RBAC client-side (segunda barrera tras el middleware) ────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    try {
      const u = JSON.parse(stored);
      if (u.role !== "ADMIN") {
        router.replace("/dashboard?acceso=denegado");
        return;
      }
      setAdminName(u.full_name  || "Administrador");
      setAdminEmail(u.email     || "admin@avendia.edu");
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "avendia_role=; path=/; max-age=0";
    document.cookie = "avendia_session=; path=/; max-age=0";
    router.push("/login");
  };

  const isActive = (href: string) =>
    href !== "#" &&
    (pathname === href ||
      (href !== "/dashboard/admin" && pathname.startsWith(href)));

  return (
    <div className="flex h-screen bg-[#F4F6FA] overflow-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ════════════════════════════════════════════════════════════════
          SIDEBAR ADMINISTRATIVO
      ════════════════════════════════════════════════════════════════ */}
      <aside className="w-60 bg-white border-r border-[#E8EDF3] flex flex-col justify-between shrink-0 h-full overflow-y-auto">
        {/* ── Branding ────────────────────────────────────────────── */}
        <div>
          <div className="px-5 py-5 border-b border-[#E8EDF3]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C6CF2] to-[#5B8DEF] flex items-center justify-center shadow-md shrink-0">
                <span className="text-white font-black text-lg tracking-tight">A</span>
              </div>
              <div className="leading-tight overflow-hidden">
                <p className="font-black text-[13px] text-slate-900 truncate">AdminPanel</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  Gestión UGECA
                </p>
              </div>
            </div>

            {/* Badge identificador de consola */}
            <div className="mt-3 px-2.5 py-1 bg-[#7C6CF2]/8 rounded-lg border border-[#7C6CF2]/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#7C6CF2] rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-[#7C6CF2] uppercase tracking-wider">
                Consola Administrativa
              </span>
            </div>
          </div>

          {/* ── Navegación ──────────────────────────────────────────── */}
          <nav className="px-3 py-4 flex flex-col gap-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Menú Principal
            </p>

            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold
                    transition-all duration-150 select-none
                    ${active
                      ? "bg-[#7C6CF2]/10 text-[#7C6CF2]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  {/* Indicador activo */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#7C6CF2] rounded-r-full" />
                  )}

                  <span className={`shrink-0 ${active ? "text-[#7C6CF2]" : "text-slate-400"}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>

                  {item.tag && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  )}
                  {item.alert && (
                    <span className="min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {item.alert}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Footer: Perfil de administrador + Logout ─────────────── */}
        <div className="px-4 py-4 border-t border-[#E8EDF3] bg-[#FAFBFD]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#7C6CF2]/15 flex items-center justify-center font-extrabold text-[#7C6CF2] text-xs shrink-0 border border-[#7C6CF2]/30">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                  {adminName}
                </p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                  Administrador
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <IcoLogout />
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════
          CONTENEDOR PRINCIPAL
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* ── Header administrativo limpio ─────────────────────────── */}
        <header className="h-14 bg-white border-b border-[#E8EDF3] px-6 flex items-center justify-between shrink-0 z-10">
          {/* Breadcrumb de ruta */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-[#7C6CF2]">AdminPanel</span>
            {pathname !== "/dashboard/admin" && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-slate-700 capitalize">
                  {pathname.split("/").pop()?.replace("-", " ")}
                </span>
              </>
            )}
          </div>

          {/* Controles del header (SOLO notificaciones y perfil — sin tabs docente) */}
          <div className="flex items-center gap-4">
            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-slate-500 hover:text-[#7C6CF2] hover:bg-[#7C6CF2]/8 rounded-xl transition-colors cursor-pointer"
              >
                <IcoBell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {/* Dropdown de notificaciones */}
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-[#E8EDF3] rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E8EDF3]">
                    <p className="font-bold text-sm text-slate-900">Notificaciones</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sistema administrativo</p>
                  </div>
                  <div className="divide-y divide-[#F0F3F8]">
                    {[
                      { icon: "💳", msg: "Nueva transacción completada", time: "hace 5 min" },
                      { icon: "👤", msg: "Nuevo docente registrado", time: "hace 1 h" },
                      { icon: "⚠️", msg: "Docente con créditos bajos: 3 usuarios", time: "hace 3 h" },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer">
                        <span className="text-base shrink-0">{n.icon}</span>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-700">{n.msg}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-[#E8EDF3]">
                    <button className="text-[10px] font-bold text-[#7C6CF2] hover:underline cursor-pointer">
                      Ver todas las notificaciones →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Separador */}
            <div className="w-px h-5 bg-slate-200" />

            {/* Perfil de administrador */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-900 leading-tight">{adminName}</p>
                <p className="text-[9px] font-bold text-[#7C6CF2] uppercase tracking-wider">Administrador</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#7C6CF2]/15 flex items-center justify-center font-extrabold text-[#7C6CF2] text-xs border border-[#7C6CF2]/30">
                {adminName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* ── Área de contenido de las páginas analíticas ──────────── */}
        <main className="flex-1 overflow-y-auto bg-[#F4F6FA]">
          {children}
        </main>
      </div>
    </div>
  );
}
