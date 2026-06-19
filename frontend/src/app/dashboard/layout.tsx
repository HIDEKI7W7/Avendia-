"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import EduAsesorChat from "@/components/chat/EduAsesorChat";

interface MenuItem {
  name: string;
  icon: string;
  path: string;
  tag?: string;
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>(null);

  // ═══════════════════════════════════════════════════════════════════════
  // AISLAMIENTO ABSOLUTO: si estamos en cualquier ruta /dashboard/admin/*
  // este layout se convierte en wrapper transparente y cede el control
  // total a admin/layout.tsx. Ningún elemento del teacher shell se renderiza.
  // ═══════════════════════════════════════════════════════════════════════
  if (pathname.startsWith("/dashboard/admin")) {
    return <>{children}</>;
  }

  // Menú principal: Módulos pedagógicos
  const [pedagogicalModules, setPedagogicalModules] = useState<MenuItem[]>([
    { name: "1. PLAN ANUAL", icon: "📅", path: "/dashboard/plan-anual" },
    { name: "2. UNIDADES", icon: "📖", path: "/dashboard/unidades" },
    { name: "3. SESIONES", icon: "📝", path: "/dashboard/sesiones" },
    { name: "4. FICHAS DE APRENDIZAJE", icon: "📙", path: "/dashboard/fichas-aprendizaje" },
    { name: "5. RÚBRICA DE EVALUACIÓN", icon: "🎯", path: "/dashboard/rubrica-evaluacion" },
    { name: "6. LISTA DE COTEJO", icon: "📋", path: "/dashboard/lista-cotejo" },
    { name: "7. TUTORÍA", icon: "👪", path: "/dashboard/tutoria" },
  ]);

  // Herramientas secundarias
  const secondaryTools: MenuItem[] = [
    { name: "VIDEOS TUTORIALES", icon: "▶️", path: "#" },
    { name: "MIS DOCUMENTOS", icon: "📁", path: "#" },
    { name: "PLANTILLAS", icon: "📄", path: "#" },
    { name: "FAVORITOS", icon: "⭐", path: "#" },
    { name: "HISTORIAL", icon: "🕒", path: "#" },
    { name: "DESCARGAS", icon: "📥", path: "#" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setCurrentUser({
            name: userObj.full_name || "Docente Premium",
            role: userObj.role || "DOCENTE",
            email: userObj.email || "",
          });
        } catch (e) {
          console.error("Error al parsear el usuario desde localStorage:", e);
        }
      } else {
        window.location.href = "/login";
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Limpiar cookies del middleware RBAC
    document.cookie = "avendia_role=; path=/; max-age=0";
    document.cookie = "avendia_session=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const handleIAWidgetClick = () => {
    // Buscar y abrir el widget del chatbot si existe
    const botButton = document.getElementById("chatbot-toggle-button");
    if (botButton) {
      botButton.click();
    }
  };

  return (
    <div className="flex h-screen bg-bg-main text-slate-800 font-body relative overflow-hidden">
      {/* Sidebar Fijo con scroll si es necesario */}
      <aside className="w-64 bg-white border-r border-border-custom flex flex-col justify-between shrink-0 h-full overflow-y-auto scrollbar-thin">
        <div className="p-6">
          {/* Logo y Branding */}
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-morado-ia to-azul-educativo flex items-center justify-center text-white font-headings font-bold text-xl shadow-md">
                A
              </div>
              <span className="font-headings font-bold text-xl text-slate-900 tracking-tight">
                AVEND
              </span>
            </div>
            <div className="pl-0.5 mt-2">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-tight">
                AVENDIA
              </span>
              <span className="block text-[8px] font-semibold text-slate-400 leading-normal">
                Planificación y documentos pedagógicos con IA
              </span>
            </div>
          </div>

          {/* Menú de Navegación Principal */}
          <nav className="flex flex-col gap-1.5 mb-6">
            {/* Inicio del Dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                pathname === "/dashboard"
                  ? "bg-morado-ia text-white shadow-md shadow-morado-ia/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>🏠</span>
              <span>INICIO</span>
            </Link>

            {/* Separador sutil */}
            <div className="h-px bg-slate-100 my-2"></div>

            {/* Enlaces a los Módulos Pedagógicos */}
            {pedagogicalModules.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-morado-ia text-white shadow-md shadow-morado-ia/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Separador */}
          <div className="h-px bg-slate-100 my-4"></div>

          {/* Bloque de Herramientas Secundarias */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1 block">
              Complementos
            </span>
            {secondaryTools.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-950 transition-colors"
              >
                <span className="text-xs text-blue-500/70">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Asistente IA, Perfil y Logout Fijo abajo */}
        <div className="p-6 border-t border-border-custom bg-slate-50/50 flex flex-col gap-4 mt-auto">
          {/* Botón flotante interno Asistente IA */}
          <button
            onClick={handleIAWidgetClick}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-border-custom hover:border-morado-ia/50 flex items-center gap-3 text-xs font-bold text-slate-700 hover:text-morado-ia shadow-sm transition-all duration-200 cursor-pointer group"
          >
            <span className="text-base group-hover:scale-110 transition-transform">🤖</span>
            <span>ASISTENTE IA</span>
          </button>

          {/* Enlace de administración rápido si es ADMIN */}
          {currentUser?.role === "ADMIN" && (
            <Link
              href="/dashboard/admin"
              className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-white text-center text-[10px] font-bold tracking-wide transition-all shadow-sm"
            >
              ⚙️ PANEL ADMINISTRADOR
            </Link>
          )}

          {/* Perfil del Usuario y Logout */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-morado-ia/10 flex items-center justify-center font-bold text-morado-ia text-xs shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "D"}
              </div>
              <div className="overflow-hidden">
                <span className="block font-headings font-bold text-xs text-slate-900 truncate leading-tight">
                  {currentUser?.name || "Cargando..."}
                </span>
                <span className="block text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                  {currentUser?.role === "ADMIN" ? "Administrador" : "Docente Premium"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Contenedor Principal de Vistas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Superior Derecho */}
        <header className="h-16 border-b border-border-custom bg-white px-8 flex items-center justify-end gap-6 shrink-0">
          {/* Campana de Notificaciones con Badge */}
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full border border-white">
              3
            </span>
          </div>

          {/* Línea divisoria */}
          <div className="w-px h-6 bg-slate-200"></div>

          {/* Perfil de Usuario */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.name || "Cargando..."}
              </span>
              <span className="block text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                {currentUser?.role === "ADMIN" ? "ADMIN" : "Docente Premium"}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-azul-educativo/10 flex items-center justify-center font-bold text-azul-educativo text-xs border border-azul-educativo/20">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "D"}
            </div>
            <span className="text-[10px] text-slate-400 cursor-pointer">▼</span>
          </div>
        </header>

        {/* Área de Contenido */}
        <div className="flex-1 overflow-y-auto bg-bg-main p-8">
          {children}
        </div>
      </div>

      {/* Widget de Chatbot Inteligente (EduAsesor) */}
      <EduAsesorChat />
    </div>
  );
}
