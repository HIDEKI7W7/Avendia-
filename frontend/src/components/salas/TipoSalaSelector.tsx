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
      <div className="w-full flex flex-col sm:flex-row gap-6 items-stretch select-none">
        {OPCIONES.map((op) => {
          const isSelected = selected === op.tipo;
          const isChat = op.tipo === "chat";
          
          return (
            <button
              key={op.tipo}
              type="button"
              onClick={() => onSelect(op.tipo)}
              className={`flex-1 flex flex-col gap-5 p-6 rounded-3xl border-2 text-left transition-all duration-300 ease-out hover:scale-[1.03] cursor-pointer group relative ${
                isSelected
                  ? isChat
                    ? "bg-[#7C6CF2]/5 border-[#7C6CF2] ring-4 ring-[#7C6CF2]/10 shadow-[0_15px_30px_rgba(124,108,242,0.08)]"
                    : "bg-[#FF7657]/5 border-[#FF7657] ring-4 ring-[#FF7657]/10 shadow-[0_15px_30px_rgba(255,118,87,0.08)]"
                  : isChat
                  ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-[#7C6CF2]/40 hover:shadow-lg"
                  : "bg-white dark:bg-slate-900 border-[#FF7657]/20 dark:border-[#FF7657]/10 hover:border-[#FF7657]/60 hover:shadow-lg"
              }`}
            >
              {/* Ícono */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 ${
                  isSelected
                    ? isChat
                      ? "bg-[#7C6CF2] text-white"
                      : "bg-[#FF7657] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200/60"
                }`}
              >
                {op.icon}
              </div>

              {/* Textos */}
              <div className="flex flex-col gap-2 flex-1">
                <span
                  className={`font-montserrat font-black text-base transition-colors leading-tight ${
                    isSelected 
                      ? isChat ? "text-[#7C6CF2]" : "text-[#FF7657]"
                      : "text-slate-850 dark:text-white"
                  }`}
                >
                  {op.titulo}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-body font-semibold">
                  {op.descripcion}
                </p>

                {/* Micro-gráficos específicos */}
                {isChat ? (
                  /* Micro-gráfico de burbujas de chat Kawaii */
                  <div className="w-full h-16 mt-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl flex items-center justify-center gap-2 overflow-hidden border border-slate-100/60 dark:border-slate-800/40 select-none">
                    <div className="bg-[#7C6CF2]/10 border border-[#7C6CF2]/20 px-3 py-1 rounded-2xl rounded-bl-none text-[8px] font-bold text-[#7C6CF2] flex items-center gap-1 animate-bounce" style={{ animationDuration: '3s' }}>
                      <span>¡Hola! 🤖</span>
                    </div>
                    <div className="bg-[#4A90E2]/10 border border-[#4A90E2]/20 px-3 py-1 rounded-2xl rounded-br-none text-[8px] font-bold text-[#4A90E2] flex items-center gap-1 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.4s' }}>
                      <span>¿Cómo te va? ✨</span>
                    </div>
                  </div>
                ) : (
                  /* Micro-gráfico de examen interactivo con borde iluminado */
                  <div className="w-full h-16 mt-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl flex flex-col justify-center px-4 gap-2 border border-[#FF7657]/15 select-none relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-8 h-8 bg-[#FF7657]/10 rounded-full blur-md" />
                    <div className="w-2/3 h-2 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="w-1/2 h-2 rounded bg-[#FF7657]/20" />
                  </div>
                )}

                <p
                  className={`text-[10px] italic font-medium mt-3 font-body ${
                    isSelected 
                      ? isChat ? "text-[#7C6CF2]" : "text-[#FF7657]"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {op.piePagina}
                </p>
              </div>

              {/* Indicador de selección pill */}
              {isSelected && (
                <div
                  className={`ml-auto mt-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
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
