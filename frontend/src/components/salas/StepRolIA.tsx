"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Settings2, HelpCircle } from "lucide-react";
import { SalaConfig, Dificultad } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 — PARÁMETROS DEL AGENTE IA
// ═══════════════════════════════════════════════════════════════════════════

const NUM_PREGUNTAS_OPTS = [5, 8, 10, 12, 15, 20];
const DIFICULTAD_OPTS: { valor: Dificultad; label: string }[] = [
  { valor: "facil", label: "Fácil" },
  { valor: "intermedio", label: "Intermedio" },
  { valor: "dificil", label: "Difícil" },
];

interface StepRolIAProps {
  config: SalaConfig;
  onChange: (patch: Partial<SalaConfig>) => void;
}

export default function StepRolIA({ config, onChange }: StepRolIAProps) {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Encabezado */}
      <div>
        <h3 className="font-headings font-black text-lg text-slate-800 dark:text-white leading-tight">
          Rol de la IA
        </h3>
        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-medium">
          Configura cómo se comportará el agente conversacional con tus estudiantes.
        </p>
      </div>

      {/* Controles principales en grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Número de preguntas */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-350">
            Número de preguntas
          </label>
          <div className="relative">
            <select
              value={config.numPreguntas}
              onChange={(e) => onChange({ numPreguntas: Number(e.target.value) })}
              className="w-full appearance-none pl-5 pr-10 py-3 text-xs text-slate-750 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full outline-none focus:border-[#7C6CF2] focus:ring-4 focus:ring-[#7C6CF2]/15 focus:shadow-[0_8px_30px_rgba(124,108,242,0.04)] transition-all duration-300 cursor-pointer font-semibold"
            >
              {NUM_PREGUNTAS_OPTS.map((n) => (
                <option key={n} value={n}>
                  {n} preguntas
                </option>
              ))}
            </select>
            <svg
              className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dificultad (Control segmentado en píldora) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Dificultad</label>
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/40 dark:border-slate-800/60 relative w-full">
            {DIFICULTAD_OPTS.map((d) => {
              const isActive = config.dificultad === d.valor;
              return (
                <button
                  key={d.valor}
                  type="button"
                  onClick={() => onChange({ dificultad: d.valor })}
                  className={`flex-1 py-2 rounded-full text-[11px] font-bold transition-all duration-300 ease-out active:scale-95 cursor-pointer relative z-10 ${
                    isActive
                      ? "bg-[#7C6CF2] text-white shadow-[0_4px_12px_rgba(124,108,242,0.25)]"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800/60 my-2" />

      {/* Opciones avanzadas — accordion */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowAdvanced((p) => !p)}
          className="flex items-center gap-2 text-xs font-bold text-[#7C6CF2] hover:text-[#6359d1] dark:hover:text-[#9082fc] transition-all duration-300 hover:scale-[1.02] cursor-pointer w-fit"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Opciones avanzadas</span>
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Contenido del accordion con transición */}
        <div
          className={`overflow-hidden transition-all duration-350 ease-in-out ${
            showAdvanced ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                Instrucciones para la IA
                <span className="font-normal text-slate-400 dark:text-slate-500">(Prompt del sistema)</span>
              </label>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                <HelpCircle className="w-3 h-3" />
                <span>Solo para profesores</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
              Este texto define el comportamiento base del agente. Puedes personalizarlo para
              adaptarlo a tu contexto pedagógico específico.
            </p>
            
            {/* Editor de código oscuro premium */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
              {/* Header simulado del editor */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-850 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">system_prompt.txt</span>
              </div>
              
              <textarea
                value={config.systemPromptPersonalizado}
                onChange={(e) =>
                  onChange({ systemPromptPersonalizado: e.target.value })
                }
                rows={7}
                spellCheck={false}
                className="w-full px-5 py-4 text-[11px] text-slate-200 placeholder:text-slate-700 bg-slate-950 outline-none focus:ring-0 transition-all duration-300 resize-none font-mono leading-relaxed shadow-[inset_0_4px_16px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
