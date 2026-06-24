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
    <aside className="w-64 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-slate-850/40 flex flex-col justify-between shrink-0 h-[calc(100vh-2rem)] my-4 ml-4 rounded-[1.75rem] shadow-xl overflow-y-auto scrollbar-thin font-body text-slate-700 dark:text-slate-300 transition-all duration-300 relative z-30">
      <div className="p-6">
        {/* Cabecera de Marca con Botón de Colapso */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-morado-ia to-azul-educativo flex items-center justify-center text-white font-headings font-extrabold text-xl shadow-[0_4px_12px_rgba(124,108,242,0.2)] group-hover:scale-105 transition-all duration-300">
              A
            </div>
            <span className="font-headings font-black text-xl text-slate-900 dark:text-slate-100 tracking-tight transition-colors duration-300 group-hover:text-morado-ia">
              AVENDIA
            </span>
          </div>
          {/* Botón flotante iconográfico de colapso */}
          <button 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95 cursor-pointer"
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
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-350 ease-in-out hover:scale-[1.02] ${
              pathname === "/dashboard"
                ? "bg-gradient-to-r from-[#7C6CF2]/12 to-[#06B6D4]/8 dark:from-[#7C6CF2]/20 dark:to-transparent text-[#7C6CF2] dark:text-[#9A8DFF] relative before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-[#7C6CF2] before:rounded-full"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
            }`}
          >
            <Home className="w-4.5 h-4.5" />
            <span>Inicio</span>
          </Link>

          {/* Bloque Categoria 1: CREACIÓN */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 block">
              Creación
            </span>
            {creationModules.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-350 ease-in-out hover:scale-[1.02] ${
                    isActive
                      ? "bg-gradient-to-r from-[#7C6CF2]/12 to-[#06B6D4]/8 dark:from-[#7C6CF2]/20 dark:to-transparent text-[#7C6CF2] dark:text-[#9A8DFF] relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#7C6CF2] before:rounded-full"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
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
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 block">
              Conoce más
            </span>
            {learnMoreModules.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-350 ease-in-out hover:scale-[1.02] ${
                    isActive
                      ? "bg-gradient-to-r from-[#7C6CF2]/12 to-[#06B6D4]/8 dark:from-[#7C6CF2]/20 dark:to-transparent text-[#7C6CF2] dark:text-[#9A8DFF] relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#7C6CF2] before:rounded-full"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
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
      <div className="p-5 border-t border-[#E8EDF3] dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/30 flex flex-col gap-4 mt-auto">
        
        {/* Perfil del Usuario */}
        <Link
          href="/dashboard/perfil"
          className="flex items-center gap-2.5 overflow-hidden border-t border-slate-100 dark:border-slate-800 pt-3 hover:opacity-85 transition-opacity cursor-pointer group/profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#7C6CF2]/10 flex items-center justify-center font-bold text-[#7C6CF2] text-xs shrink-0 shadow-inner group-hover/profile:scale-105 transition-transform">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "D"}
          </div>
          <div className="overflow-hidden flex-1">
            <span className="block font-headings font-bold text-xs text-slate-900 dark:text-slate-100 truncate leading-tight group-hover/profile:text-morado-ia transition-colors">
              {user?.full_name || (loading ? "Cargando..." : "Docente")}
            </span>
            <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
              {user?.role === "ADMIN"
                ? "Administrador"
                : planTier === "PREMIUM"
                ? "Docente Premium"
                : "Docente Gratuito"}
            </span>
          </div>
        </Link>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={logout}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
