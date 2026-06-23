"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { UserProvider } from "@/context/UserContext";
import Sidebar from "@/components/layout/Sidebar";
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
  const pathname = usePathname();
  const isChatWorkspace = pathname === "/dashboard/chat";

  return (
    <div className="flex h-screen bg-bg-main text-slate-800 font-body relative overflow-hidden">
      {/* Columna Izquierda: Sidebar modular unificado */}
      <Sidebar />

      {/* Columna Derecha: Contenido Principal Fluido */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Área de Contenido — la ruta /dashboard/chat ocupa h-full sin scroll externo */}
        <div
          className={`flex-1 bg-bg-main ${
            isChatWorkspace
              ? "h-full overflow-hidden p-6"
              : "overflow-y-auto p-8"
          }`}
        >
          {children}
        </div>
      </div>

      {/* Widget de Chatbot Inteligente (EduAsesor) — se oculta en la ruta de chat dedicado */}
      {!isChatWorkspace && <EduAsesorChat />}
    </div>
  );
}
