"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  tag?: string;
  tagColor?: string;
  alert?: number;
}

const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const IconReport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const IconSupport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconConfig = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" />
  </svg>
);
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",           icon: <IconChart />,   href: "/dashboard/admin" },
  { label: "Usuarios",            icon: <IconUsers />,   href: "/dashboard/admin/users" },
  { label: "Biblioteca Global",   icon: <IconBook />,    href: "#", tag: "IA", tagColor: "bg-violet-100 text-violet-700" },
  { label: "Reportes",            icon: <IconReport />,  href: "#" },
  { label: "Soporte",             icon: <IconSupport />, href: "#", alert: 5 },
  { label: "Configuración",       icon: <IconConfig />,  href: "#" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [adminName, setAdminName] = useState("Administrador");

  // ── Guardia RBAC client-side ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("user");
    if (!stored) { router.replace("/login"); return; }
    try {
      const u = JSON.parse(stored);
      if (u.role !== "ADMIN") { router.replace("/dashboard?acceso=denegado"); return; }
      setAdminName(u.full_name || "Administrador");
    } catch { router.replace("/login"); }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "avendia_role=; path=/; max-age=0";
    document.cookie = "avendia_session=; path=/; max-age=0";
    router.push("/login");
  };

  const isActive = (href: string) =>
    href !== "#" && (pathname === href || (href !== "/dashboard/admin" && pathname.startsWith(href)));

  return (
    <div className="flex h-screen bg-[#F4F6FA] font-sans overflow-hidden">
      {/* ──── SIDEBAR ───────────────────────────────────────────────────── */}
      <aside className="w-60 bg-white border-r border-[#E8EDF3] flex flex-col justify-between shrink-0 h-full">
        {/* Branding */}
        <div>
          <div className="px-5 py-5 border-b border-[#E8EDF3]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C6CF2] to-[#5B8DEF] flex items-center justify-center text-white font-bold text-base shadow-sm">
                A
              </div>
              <div className="leading-tight">
                <p className="font-bold text-[13px] text-slate-900">AdminPanel</p>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Gestión UGECA</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="px-3 py-4 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-150 relative
                    ${active
                      ? "bg-[#7C6CF2]/10 text-[#7C6CF2]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  <span className={active ? "text-[#7C6CF2]" : "text-slate-400"}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.tag && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  )}
                  {item.alert && (
                    <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.alert}
                    </span>
                  )}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#7C6CF2] rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: Perfil + Logout */}
        <div className="px-4 py-4 border-t border-[#E8EDF3]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#7C6CF2]/15 flex items-center justify-center font-bold text-[#7C6CF2] text-xs shrink-0">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{adminName}</p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Administrador</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      {/* ──── MAIN CONTENT ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
