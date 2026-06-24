"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { UserProvider } from "@/context/UserContext";
import Sidebar from "@/components/layout/Sidebar";
import EduAsesorChat from "@/components/chat/EduAsesorChat";
import CommandPalette from "@/components/shared/CommandPalette";

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
  const pathname = usePathname();
  const isChatWorkspace = pathname === "/dashboard/chat";

  return (
    <div className="flex h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-800 dark:text-slate-100 font-body relative overflow-hidden transition-colors duration-300">
      {/* Columna Izquierda: Sidebar modular unificado */}
      <Sidebar />

      {/* Columna Derecha: Contenido Principal Fluido */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Área de Contenido — la ruta /dashboard/chat ocupa h-full sin scroll externo */}
        <div
          className={`flex-1 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 shadow-[0_20px_50px_rgba(124,108,242,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] my-4 mr-4 rounded-[1.75rem] transition-colors duration-300 ${
            isChatWorkspace
              ? "h-[calc(100vh-2rem)] overflow-hidden p-6"
              : "h-[calc(100vh-2rem)] overflow-y-auto p-8"
          }`}
        >
          {children}
        </div>
      </div>

      {/* Widget de Chatbot Inteligente (EduAsesor) — se oculta en la ruta de chat dedicado */}
      {!isChatWorkspace && <EduAsesorChat />}

      {/* Paleta de Comandos Global (Ctrl + K) */}
      <CommandPalette />
    </div>
  );
}
