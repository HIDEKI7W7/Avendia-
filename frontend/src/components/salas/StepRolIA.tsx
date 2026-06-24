"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { SalaConfig, Dificultad } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 — PARÁMETROS DEL AGENTE IA
// ═══════════════════════════════════════════════════════════════════════════

const NUM_PREGUNTAS_OPTS = [5, 8, 10, 12, 15, 20];
const DIFICULTAD_OPTS: { valor: Dificultad; label: string; colorClass: string }[] = [
  { valor: "facil", label: "Fácil", colorClass: "text-emerald-600" },
  { valor: "intermedio", label: "Intermedio", colorClass: "text-amber-600" },
  { valor: "dificil", label: "Difícil", colorClass: "text-red-500" },
];

interface StepRolIAProps {
  config: SalaConfig;
  onChange: (patch: Partial<SalaConfig>) => void;
}

export default function StepRolIA({ config, onChange }: StepRolIAProps) {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <h3 className="font-headings font-black text-lg text-slate-900 leading-tight">
          Rol de la IA
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Configura cómo se comportará el agente conversacional con tus estudiantes.
        </p>
      </div>

      {/* Controles principales en grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Número de preguntas */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">
            Número de preguntas
          </label>
          <div className="relative">
            <select
              value={config.numPreguntas}
              onChange={(e) => onChange({ numPreguntas: Number(e.target.value) })}
              className="w-full appearance-none pl-4 pr-10 py-3 text-sm text-slate-700 bg-white border border-[#E8EDF3] rounded-xl outline-none focus:border-morado-ia focus:ring-4 focus:ring-morado-ia/10 focus:shadow-[0_4px_12px_rgba(124,108,242,0.04)] transition-all duration-300 cursor-pointer font-body"
            >
              {NUM_PREGUNTAS_OPTS.map((n) => (
                <option key={n} value={n}>
                  {n} preguntas
                </option>
              ))}
            </select>
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
        </div>

        {/* Dificultad */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Dificultad</label>
          <div className="flex gap-2">
            {DIFICULTAD_OPTS.map((d) => {
              const isActive = config.dificultad === d.valor;
              return (
                <button
                  key={d.valor}
                  type="button"
                  onClick={() => onChange({ dificultad: d.valor })}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer ${
                    isActive
                      ? "bg-morado-ia text-white border-morado-ia shadow-[0_4px_12px_rgba(124,108,242,0.2)]"
                      : "bg-white text-slate-500 border-[#E8EDF3] hover:border-slate-300"
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
      <div className="border-t border-slate-100" />

      {/* Opciones avanzadas — accordion */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowAdvanced((p) => !p)}
          className="flex items-center gap-2 text-xs font-bold text-morado-ia hover:text-[#6359d1] transition-all duration-300 hover:scale-[1.02] cursor-pointer w-fit"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Opciones avanzadas
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Contenido del accordion con transición */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showAdvanced ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-xs font-bold text-slate-700">
              Instrucciones para la IA{" "}
              <span className="font-normal text-slate-400">(Prompt del sistema)</span>
            </label>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Este texto define el comportamiento base del agente. Puedes personalizarlo para
              adaptarlo a tu contexto pedagógico específico.
            </p>
            <textarea
              value={config.systemPromptPersonalizado}
              onChange={(e) =>
                onChange({ systemPromptPersonalizado: e.target.value })
              }
              rows={8}
              spellCheck={false}
              className="w-full px-4 py-3 text-xs text-slate-100 placeholder:text-slate-505 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-morado-ia/20 transition-all duration-300 resize-none font-mono leading-relaxed shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
