"use client";

import React from "react";
import { PenTool, BookOpen, Upload, Check } from "lucide-react";
import { SalaConfig, OrigenContenido } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2 — ORIGEN DEL CONTENIDO
// ═══════════════════════════════════════════════════════════════════════════

interface OrigenOption {
  valor: OrigenContenido;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

const OPCIONES: OrigenOption[] = [
  {
    valor: "tema",
    titulo: "Desde un tema o tus preguntas",
    descripcion:
      "Escribe un tema o pega tus propias preguntas y la IA las usará como base de la evaluación.",
    icon: <PenTool className="w-5.5 h-5.5" />,
    iconColor: "text-[#7C6CF2]",
    iconBg: "bg-[#7C6CF2]/10",
  },
  {
    valor: "documento",
    titulo: "Desde un Documento interno",
    descripcion:
      "Selecciona uno de tus documentos generados en AVENDIA (Unidad, Plan Anual, etc.) como fuente.",
    icon: <BookOpen className="w-5.5 h-5.5" />,
    iconColor: "text-[#4A90E2]",
    iconBg: "bg-[#4A90E2]/10",
  },
  {
    valor: "archivo",
    titulo: "Subir archivo",
    descripcion:
      "Carga un PDF, Word o texto plano desde tu dispositivo para que la IA extraiga el contenido.",
    icon: <Upload className="w-5.5 h-5.5" />,
    iconColor: "text-[#34D399]",
    iconBg: "bg-[#34D399]/10",
  },
];

interface StepContenidoProps {
  config: SalaConfig;
  onChange: (patch: Partial<SalaConfig>) => void;
}

export default function StepContenido({ config, onChange }: StepContenidoProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <h3 className="font-headings font-black text-lg text-slate-900 dark:text-white leading-tight">
          ¿De dónde viene el contenido?
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-body">
          La fuente que elijas determinará cómo la IA preparará las preguntas y el contexto de la sala.
        </p>
      </div>

      {/* Grid triple de tarjetas Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
        {OPCIONES.map((op) => {
          const isSelected = config.origenContenido === op.valor;
          return (
            <button
              key={op.valor}
              type="button"
              onClick={() => onChange({ origenContenido: op.valor })}
              className={`flex flex-col items-center gap-4 p-5 rounded-3xl border-2 text-center cursor-pointer transition-all duration-350 ease-out hover:scale-[1.03] group ${
                isSelected
                  ? "bg-gradient-to-br from-[#7C6CF2]/10 via-[#7C6CF2]/5 to-transparent border-[#7C6CF2] shadow-[0_12px_30px_rgba(124,108,242,0.08)]"
                  : "bg-white dark:bg-slate-900 border-[#E8EDF3] dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
              }`}
            >
              {/* Ícono con color de la marca */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-108 group-hover:rotate-2 shadow-inner ${
                  isSelected
                    ? `${op.iconBg} ${op.iconColor}`
                    : "bg-slate-50 dark:bg-slate-800 text-slate-550 group-hover:bg-slate-100"
                }`}
              >
                {op.icon}
              </div>

              {/* Título */}
              <span
                className={`font-montserrat font-bold text-sm leading-tight transition-colors duration-300 ${
                  isSelected ? "text-[#7C6CF2]" : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {op.titulo}
              </span>

              {/* Descripción */}
              <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-body font-semibold">
                {op.descripcion}
              </p>

              {/* Check indicador de selección */}
              {isSelected ? (
                <div className="w-5 h-5 rounded-full bg-[#7C6CF2] text-white flex items-center justify-center mt-auto shadow-sm shadow-[#7C6CF2]/30">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-800 mt-auto" />
              )}
            </button>
          );
        })}
      </div>

      {/* Nota contextual según origen seleccionado */}
      {config.origenContenido === "archivo" && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium leading-relaxed">
          📎 Podrás subir el archivo en el siguiente paso. Formatos aceptados: PDF, DOCX, TXT (máx. 10 MB).
        </div>
      )}
      {config.origenContenido === "documento" && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 font-medium leading-relaxed">
          📄 Se mostrará la lista de documentos disponibles en tu historial de AVENDIA para que selecciones uno.
        </div>
      )}
    </div>
  );
}
