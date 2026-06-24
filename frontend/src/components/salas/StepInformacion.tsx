"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { SalaConfig } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1 — INFORMACIÓN BÁSICA DE LA SALA
// ═══════════════════════════════════════════════════════════════════════════

interface StepInformacionProps {
  config: SalaConfig;
  onChange: (patch: Partial<SalaConfig>) => void;
  error: string | null;
}

const AULAS_MOCK = [
  { id: null, label: "Abierta (sin aula vinculada)" },
  { id: "aula-1", label: "5to Grado A — Matemática" },
  { id: "aula-2", label: "4to Grado B — Comunicación" },
  { id: "aula-3", label: "3er Grado — Ciencia y Tecnología" },
];

export default function StepInformacion({
  config,
  onChange,
  error,
}: StepInformacionProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Título del paso */}
      <div>
        <h3 className="font-headings font-black text-lg text-slate-900 leading-tight">
          Información básica
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Define el nombre y las instrucciones iniciales que verán tus estudiantes.
        </p>
      </div>

      {/* Error de validación */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Campo: Nombre de la sala */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
          Nombre de la sala
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={config.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="Ej: Examen de Biología — 5to Secundaria"
          maxLength={100}
          className={`w-full px-5 py-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900 border rounded-2xl outline-none transition-all duration-300 font-body leading-relaxed ${
            error && !config.nombre
              ? "border-red-300 ring-4 ring-red-100/50"
              : "border-slate-200/80 dark:border-slate-800 focus:border-[#7C6CF2] focus:ring-4 focus:ring-[#7C6CF2]/15 focus:shadow-[0_8px_30px_rgba(124,108,242,0.06)]"
          }`}
        />
        <span className="text-[10px] text-slate-400 text-right">
          {config.nombre.length}/100
        </span>
      </div>

      {/* Campo: Instrucciones para los estudiantes */}
      <div className="flex flex-col gap-1.5 font-body">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Instrucciones para los estudiantes
        </label>
        <textarea
          value={config.instruccionesEstudiante}
          onChange={(e) => onChange({ instruccionesEstudiante: e.target.value })}
          placeholder="Ej: Lee con atención cada pregunta antes de responder. Dispones de 30 minutos para completar la evaluación."
          rows={4}
          className="w-full px-5 py-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl outline-none focus:border-[#7C6CF2] focus:ring-4 focus:ring-[#7C6CF2]/15 focus:shadow-[0_8px_30px_rgba(124,108,242,0.06)] transition-all duration-300 resize-none font-body leading-relaxed"
        />
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
          Estas instrucciones aparecerán al inicio de la sesión para orientar al estudiante.
        </p>
      </div>

      {/* Campo: Vincular a un aula */}
      <div className="flex flex-col gap-1.5 font-body">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Vincular a un aula
        </label>
        <div className="relative">
          <select
            value={config.aulaVinculadaId ?? ""}
            onChange={(e) =>
              onChange({ aulaVinculadaId: e.target.value || null })
            }
            className="w-full appearance-none pl-5 pr-10 py-3.5 text-sm text-slate-750 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl outline-none focus:border-[#7C6CF2] focus:ring-4 focus:ring-[#7C6CF2]/15 focus:shadow-[0_8px_30px_rgba(124,108,242,0.06)] transition-all duration-300 cursor-pointer font-body"
          >
            {AULAS_MOCK.map((a) => (
              <option key={String(a.id)} value={a.id ?? ""}>
                {a.label}
              </option>
            ))}
          </select>
          {/* Flecha decorativa */}
          <svg
            className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <p className="text-[10px] text-slate-400">
          Vincular a un aula permite hacer seguimiento del progreso de tus estudiantes.
        </p>
      </div>
    </div>
  );
}
