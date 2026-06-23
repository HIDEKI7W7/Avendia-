"use client";

import React from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import Sidebar from "@/components/dashboard/Sidebar";
import EduAsesorChat from "@/components/chat/EduAsesorChat";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  
  const role = user?.role || "DOCENTE";
  const planTier = user?.plan_tier || "FREE";

  return (
    <div className="flex h-screen bg-bg-main text-slate-800 font-body relative overflow-hidden">
      {/* Sidebar Component con estado de usuario reactivo */}
      <Sidebar />

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

          {/* Perfil de Usuario sincronizado con el estado global */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-900 leading-tight">
                {user?.full_name || (loading ? "Cargando..." : "Docente")}
              </span>
              <span className="block text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                {role === "ADMIN" 
                  ? "ADMIN" 
                  : planTier === "PREMIUM" 
                  ? "DOCENTE PREMIUM" 
                  : "DOCENTE GRATUITO"}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-azul-educativo/10 flex items-center justify-center font-bold text-azul-educativo text-xs border border-azul-educativo/20">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "D"}
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
