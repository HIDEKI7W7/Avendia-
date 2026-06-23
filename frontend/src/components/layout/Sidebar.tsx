"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Columns4,
  Home,
  LayoutGrid,
  MessageSquare,
  GraduationCap,
  FileText,
  Users,
  Star,
  ClipboardList,
  HelpCircle,
  MessagesSquare,
  LogOut,
} from "lucide-react";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  
  // INYECCIÓN DE ESTADO DINÁMICO: Consumo de estado centralizado mediante custom hook useUser
  const { user, loading, logout } = useUser();

  const credits = user?.credits ?? 0;
  const creditsTotal = user?.credits_total ?? 0;
  const planTier = user?.plan_tier ?? "FREE";

  // Ítems de la Categoría "CREACIÓN"
  const creationModules: MenuItem[] = [
    { name: "Herramientas", icon: <LayoutGrid className="w-4.5 h-4.5" />, path: "/dashboard/herramientas" },
    { name: "EduAsesor Chat", icon: <MessageSquare className="w-4.5 h-4.5" />, path: "/dashboard/chat" },
    { name: "Mis aulas", icon: <GraduationCap className="w-4.5 h-4.5" />, path: "/dashboard/aulas" },
    { name: "Documentos", icon: <FileText className="w-4.5 h-4.5" />, path: "/dashboard/documentos" },
    { name: "Salas Avendia", icon: <Users className="w-4.5 h-4.5" />, path: "/dashboard/salas" },
  ];

  // Ítems de la Categoría "CONOCE MÁS"
  const learnMoreModules: MenuItem[] = [
    { name: "Referidos", icon: <Star className="w-4.5 h-4.5" />, path: "/dashboard/referidos" },
    { name: "Formato escolar", icon: <ClipboardList className="w-4.5 h-4.5" />, path: "/dashboard/formato" },
    { name: "Centro de ayuda", icon: <HelpCircle className="w-4.5 h-4.5" />, path: "/dashboard/ayuda" },
    { name: "Comunidad", icon: <MessagesSquare className="w-4.5 h-4.5" />, path: "/dashboard/comunidad" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border-custom flex flex-col justify-between shrink-0 h-full overflow-y-auto scrollbar-thin font-body text-slate-700">
      <div className="p-6">
        {/* Cabecera de Marca con Botón de Colapso */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-morado-ia to-azul-educativo flex items-center justify-center text-white font-headings font-extrabold text-xl shadow-md">
              A
            </div>
            <span className="font-headings font-black text-xl text-slate-900 tracking-tight">
              AVENDIA
            </span>
          </div>
          {/* Botón flotante iconográfico de colapso */}
          <button 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Colapsar"
          >
            <Columns4 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Menú de Navegación */}
        <div className="flex flex-col gap-5">
          {/* Ítem Destacado Principal: Inicio */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              pathname === "/dashboard"
                ? "bg-[#7C6CF2]/10 text-[#7C6CF2] border border-[#7C6CF2]/15"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
            }`}
          >
            <Home className="w-4.5 h-4.5" />
            <span>Inicio</span>
          </Link>

          {/* Bloque Categoria 1: CREACIÓN */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 block">
              Creación
            </span>
            {creationModules.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#7C6CF2]/10 text-[#7C6CF2] border border-[#7C6CF2]/15"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bloque Categoria 2: CONOCE MÁS */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 block">
              Conoce más
            </span>
            {learnMoreModules.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#7C6CF2]/10 text-[#7C6CF2] border border-[#7C6CF2]/15"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Widget de Créditos y Cierre de Sesión Fijo abajo */}
      <div className="p-6 border-t border-border-custom bg-slate-50/50 flex flex-col gap-4 mt-auto">
        
        {/* Tarjeta de Créditos redondeada estilo Premium */}
        <div className="bg-gradient-to-br from-[#7C6CF2]/8 to-[#FF7657]/8 border border-[#7C6CF2]/12 rounded-3xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[8px] bg-[#FF7657]/10 border border-[#FF7657]/20 text-[#FF7657] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
              {planTier === "PREMIUM" ? "Plan Premium" : "¡Hazte Premium!"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none">Créditos</span>
              <div className="flex items-baseline gap-1 mt-1">
                {loading ? (
                  <div className="h-6 w-12 bg-slate-100 animate-pulse rounded" />
                ) : (
                  <>
                    <span className="text-2xl font-headings font-black text-slate-900">{credits}</span>
                    <span className="text-[10px] text-slate-400 font-bold">/ {creditsTotal}</span>
                  </>
                )}
              </div>
            </div>
            {/* Moneda dorada estilizada y rotada */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-base shadow-md rotate-12 transform hover:scale-105 transition-transform duration-300">
              🪙
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="#planes"
              className="text-[9px] font-bold text-[#7C6CF2] hover:text-[#5B4DC4] transition-colors"
            >
              Conoce más →
            </Link>
          </div>
        </div>

        {/* Perfil del Usuario */}
        <div className="flex items-center gap-2.5 overflow-hidden border-t border-slate-100 pt-3">
          <div className="w-8 h-8 rounded-full bg-[#7C6CF2]/10 flex items-center justify-center font-bold text-[#7C6CF2] text-xs shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "D"}
          </div>
          <div className="overflow-hidden flex-1">
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

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={logout}
          className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>CERRAR SESIÓN</span>
        </button>
      </div>
    </aside>
  );
}
