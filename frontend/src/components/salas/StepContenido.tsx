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
}

const OPCIONES: OrigenOption[] = [
  {
    valor: "tema",
    titulo: "Desde un tema o tus preguntas",
    descripcion:
      "Escribe un tema o pega tus propias preguntas y la IA las usará como base de la evaluación.",
    icon: <PenTool className="w-6 h-6" />,
  },
  {
    valor: "documento",
    titulo: "Desde un Documento interno",
    descripcion:
      "Selecciona uno de tus documentos generados en AVENDIA (Unidad, Plan Anual, etc.) como fuente.",
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    valor: "archivo",
    titulo: "Subir archivo",
    descripcion:
      "Carga un PDF, Word o texto plano desde tu dispositivo para que la IA extraiga el contenido.",
    icon: <Upload className="w-6 h-6" />,
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
        <h3 className="font-headings font-black text-lg text-slate-900 leading-tight">
          ¿De dónde viene el contenido?
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          La fuente que elijas determinará cómo la IA preparará las preguntas y el contexto de la sala.
        </p>
      </div>

      {/* Grid triple de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OPCIONES.map((op) => {
          const isSelected = config.origenContenido === op.valor;
          return (
            <button
              key={op.valor}
              type="button"
              onClick={() => onChange({ origenContenido: op.valor })}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.03] group ${
                isSelected
                  ? "bg-morado-ia/5 border-morado-ia shadow-[0_8px_30px_rgba(124,108,242,0.1)]"
                  : "bg-white border-[#E8EDF3] hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
              }`}
            >
              {/* Ícono */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                  isSelected
                    ? "bg-[#7C6CF2]/10 text-[#7C6CF2]"
                    : "bg-slate-50 text-slate-500 group-hover:bg-slate-100 shadow-inner"
                }`}
              >
                {op.icon}
              </div>

              {/* Título */}
              <span
                className={`font-headings font-bold text-sm leading-tight transition-colors duration-300 ${
                  isSelected ? "text-[#7C6CF2]" : "text-slate-800"
                }`}
              >
                {op.titulo}
              </span>

              {/* Descripción */}
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {op.descripcion}
              </p>

              {/* Check indicador de selección */}
              {isSelected ? (
                <div className="w-5 h-5 rounded-full bg-morado-ia text-white flex items-center justify-center mt-auto shadow-sm shadow-[#7C6CF2]/30">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-200 mt-auto" />
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
