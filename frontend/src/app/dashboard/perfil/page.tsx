"use client";

import React from "react";
import ProfileForm from "@/components/layout/ProfileForm";
import { User, Shield, Sparkles } from "lucide-react";

export default function PerfilPage() {
  return (
    <div className="max-w-4xl mx-auto pb-12 font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Cabecera */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5.5 h-5.5 text-[#7C6CF2] animate-pulse" />
          <span className="text-[10px] font-headings font-black text-[#7C6CF2] uppercase tracking-widest">
            Ajustes del Sistema
          </span>
        </div>
        <h1 className="text-3xl font-headings font-black text-slate-900 dark:text-white tracking-tight">
          Perfil del Docente
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Configura tus datos informativos, institución educativa y preferencias pedagógicas para la IA.
        </p>
      </header>

      {/* Contenedor Principal */}
      <div className="bg-white dark:bg-slate-900 border border-[#E8EDF3] dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-[0_4px_30px_rgba(74,90,226,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#7C6CF2]/10 flex items-center justify-center text-[#7C6CF2] shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-headings font-bold text-sm text-slate-800 dark:text-slate-200">
              Información de la Cuenta
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
              Estos campos se sincronizan con las herramientas de planificación.
            </p>
          </div>
        </div>

        <ProfileForm />
      </div>
    </div>
  );
}
