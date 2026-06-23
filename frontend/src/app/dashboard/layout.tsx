"use client";

import React from "react";
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
  return (
    <div className="flex h-screen bg-bg-main text-slate-800 font-body relative overflow-hidden">
      {/* Columna Izquierda: Sidebar modular unificado */}
      <Sidebar />

      {/* Columna Derecha: Contenido Principal Fluido */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Área de Contenido que recibe el {children} con la nueva barra superior integrada */}
        <div className="flex-1 overflow-y-auto bg-bg-main p-8">
          {children}
        </div>
      </div>

      {/* Widget de Chatbot Inteligente (EduAsesor) */}
      <EduAsesorChat />
    </div>
  );
}
