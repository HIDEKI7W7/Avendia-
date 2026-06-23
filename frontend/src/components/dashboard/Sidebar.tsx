"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface MenuItem {
  name: string;
  icon: string;
  path: string;
  tag?: string;
  badge?: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  
  // INYECCIÓN DE ESTADO DINÁMICO: Consumo de estado centralizado mediante custom hook useUser
  const { user, loading, logout } = useUser();

  const credits = user?.credits ?? 0;
  const creditsTotal = user?.credits_total ?? 0;
  const planTier = user?.plan_tier ?? "FREE";

  // Menú principal: Módulos pedagógicos
  const pedagogicalModules: MenuItem[] = [
    { name: "1. PLAN ANUAL", icon: "📅", path: "/dashboard/plan-anual" },
    { name: "2. UNIDADES", icon: "📖", path: "/dashboard/unidades" },
    { name: "3. SESIONES", icon: "📝", path: "/dashboard/sesiones" },
    { name: "4. FICHAS DE APRENDIZAJE", icon: "📙", path: "/dashboard/fichas-aprendizaje" },
    { name: "5. RÚBRICA DE EVALUACIÓN", icon: "🎯", path: "/dashboard/rubrica-evaluacion" },
    { name: "6. LISTA DE COTEJO", icon: "📋", path: "/dashboard/lista-cotejo" },
    { name: "7. TUTORÍA", icon: "👪", path: "/dashboard/tutoria" },
  ];

  // Herramientas secundarias
  const secondaryTools: MenuItem[] = [
    { name: "VIDEOS TUTORIALES", icon: "▶️", path: "#" },
    { name: "MIS DOCUMENTOS", icon: "📁", path: "#" },
    { name: "PLANTILLAS", icon: "📄", path: "#" },
    { name: "FAVORITOS", icon: "⭐", path: "#" },
    { name: "HISTORIAL", icon: "🕒", path: "#" },
    { name: "DESCARGAS", icon: "📥", path: "#" },
  ];

  const handleIAWidgetClick = () => {
    // Buscar y abrir el widget del chatbot si existe
    const botButton = document.getElementById("chatbot-toggle-button");
    if (botButton) {
      botButton.click();
    }
  };

  return (
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

        {/* INYECCIÓN DE ESTADO DINÁMICO: Widget de créditos dinámico (Consumido de useUser) */}
        <div className="bg-white border border-border-custom rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Créditos</span>
            {loading ? (
              <div className="h-4 w-12 bg-slate-100 animate-pulse rounded" />
            ) : planTier === "PREMIUM" ? (
              <span className="text-[8px] bg-purple-50 border border-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-extrabold uppercase">
                Plan Premium Activo
              </span>
            ) : (
              <Link
                href="/login"
                onClick={logout}
                className="text-[8px] bg-amber-50 border border-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-extrabold uppercase hover:bg-amber-100 transition-colors"
              >
                ¡Hazte Premium!
              </Link>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            {loading ? (
              <div className="h-6 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <>
                <span className="text-xl font-headings font-bold text-slate-900">🪙 {credits}</span>
                <span className="text-[9px] text-slate-400 font-semibold ml-1">/ {creditsTotal}</span>
              </>
            )}
          </div>
          {/* Barra de progreso visual */}
          {!loading && (
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C6CF2] to-[#4A90E2] transition-all duration-500"
                style={{ width: `${Math.min(100, (credits / (creditsTotal || 1)) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* INYECCIÓN DE ESTADO DINÁMICO: Perfil del Usuario y Cierre de Sesión */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-morado-ia/10 flex items-center justify-center font-bold text-morado-ia text-xs shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "D"}
            </div>
            <div className="overflow-hidden">
              <span className="block font-headings font-bold text-xs text-slate-900 truncate leading-tight">
                {user?.full_name || (loading ? "Cargando..." : "Docente")}
              </span>
              <span className="block text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                {user?.role === "ADMIN"
                  ? "Administrador"
                  : planTier === "PREMIUM"
                  ? "Docente Premium"
                  : "Docente Gratuito"}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Cerrar Sesión"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}
