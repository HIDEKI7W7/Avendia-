"use client";

import React from "react";
import { MessageSquare, FileText, ArrowRight } from "lucide-react";
import { TipoSala } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// SELECTOR DE TIPO DE SALA — Paso previo al wizard
// ═══════════════════════════════════════════════════════════════════════════

interface TipoOption {
  tipo: TipoSala;
  titulo: string;
  descripcion: string;
  piePagina: string;
  icon: React.ReactNode;
  accentColor: string;
  bgSelected: string;
  borderSelected: string;
}

const OPCIONES: TipoOption[] = [
  {
    tipo: "chat",
    titulo: "Conversar con la IA",
    descripcion:
      "Tu alumno chatea con la IA sobre un tema y la IA lo evalúa con preguntas orientadoras para verificar su comprensión.",
    piePagina: "Para reforzar conceptos, debate, exposiciones orales",
    icon: <MessageSquare className="w-7 h-7" />,
    accentColor: "text-[#7C6CF2]",
    bgSelected: "bg-[#7C6CF2]/5",
    borderSelected: "border-[#7C6CF2]",
  },
  {
    tipo: "examen",
    titulo: "Examen interactivo",
    descripcion:
      "La IA aplica un examen con preguntas generadas automáticamente sobre el contenido que tú definas y entrega retroalimentación inmediata.",
    piePagina: "Para evaluaciones bimestrales, pruebas diagnósticas o de salida",
    icon: <FileText className="w-7 h-7" />,
    accentColor: "text-[#FF7657]",
    bgSelected: "bg-[#FF7657]/5",
    borderSelected: "border-[#FF7657]",
  },
];

interface TipoSalaSelectorProps {
  selected: TipoSala | null;
  onSelect: (tipo: TipoSala) => void;
  onNext: () => void;
}

export default function TipoSalaSelector({
  selected,
  onSelect,
  onNext,
}: TipoSalaSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      {/* Título orientador */}
      <div className="text-center">
        <h2 className="font-headings font-black text-2xl text-slate-900 tracking-tight">
          ¿Qué tipo de sala quieres crear?
        </h2>
        <p className="text-sm text-slate-500 mt-2 font-body">
          Elige el modo de interacción que mejor se adapte a tu objetivo pedagógico.
        </p>
      </div>

      {/* Tarjetas de selección */}
      <div className="w-full flex flex-col sm:flex-row gap-4">
        {OPCIONES.map((op) => {
          const isSelected = selected === op.tipo;
          return (
            <button
              key={op.tipo}
              type="button"
              onClick={() => onSelect(op.tipo)}
              className={`flex-1 flex flex-col gap-4 p-6 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? `${op.bgSelected} ${op.borderSelected} shadow-sm`
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {/* Ícono */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
                  isSelected
                    ? `${op.accentColor} ${op.bgSelected}`
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}
              >
                {op.icon}
              </div>

              {/* Textos */}
              <div className="flex flex-col gap-2">
                <span
                  className={`font-headings font-black text-base transition-colors ${
                    isSelected ? op.accentColor : "text-slate-800"
                  }`}
                >
                  {op.titulo}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">{op.descripcion}</p>
                <p
                  className={`text-[11px] italic font-medium mt-1 ${
                    isSelected ? op.accentColor : "text-slate-400"
                  }`}
                >
                  {op.piePagina}
                </p>
              </div>

              {/* Indicador de selección */}
              {isSelected && (
                <div
                  className={`ml-auto mt-auto w-5 h-5 rounded-full flex items-center justify-center ${
                    op.tipo === "chat" ? "bg-[#7C6CF2]" : "bg-[#FF7657]"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* CTA continuar */}
      <button
        type="button"
        disabled={!selected}
        onClick={onNext}
        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-headings font-bold text-sm transition-all duration-200 cursor-pointer ${
          selected
            ? "bg-[#7C6CF2] text-white hover:bg-[#6359d1] shadow-sm shadow-[#7C6CF2]/25 active:scale-95"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        Continuar
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
