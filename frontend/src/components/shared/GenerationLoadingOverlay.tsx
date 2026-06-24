"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface GenerationLoadingOverlayProps {
  isOpen?: boolean;
}

const MICRO_TEXTS = [
  "Analizando competencias del CNEB / Currículo Oficial...",
  "Redactando criterios de evaluación de alta precisión...",
  "Estructurando formato descargable...",
  "Vinculando campos y recursos didácticos oficiales...",
  "Estableciendo niveles de logro e instrumentos de evaluación...",
  "Compilando y estructurando el archivo Word (.docx)..."
];

export default function GenerationLoadingOverlay({ isOpen = true }: GenerationLoadingOverlayProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % MICRO_TEXTS.length);
        setFade(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Estilo local para animación de escaneo */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0.1; }
          50% { opacity: 1; }
          100% { transform: translateY(180px); opacity: 0.1; }
        }
        .animate-scan {
          animation: scan 3s infinite linear;
        }
      `}} />

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300 text-center">
        
        {/* Skeleton Animado de Hoja de Papel */}
        <div className="w-40 h-48 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3.5 relative bg-white dark:bg-slate-800/30 shadow-inner overflow-hidden shrink-0">
          {/* Cabecera del documento */}
          <div className="h-4 bg-slate-100 dark:bg-slate-700/60 rounded-md w-2/3 animate-pulse" />
          
          {/* Párrafo 1 */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full w-full animate-pulse [animation-delay:0.2s]" />
            <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full w-11/12 animate-pulse [animation-delay:0.4s]" />
            <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full w-4/5 animate-pulse [animation-delay:0.6s]" />
          </div>

          {/* Separador */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-0.5" />

          {/* Párrafo 2 */}
          <div className="flex flex-col gap-2">
            <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full w-full animate-pulse [animation-delay:0.8s]" />
            <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full w-5/6 animate-pulse [animation-delay:1s]" />
            <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full w-3/4 animate-pulse [animation-delay:1.2s]" />
          </div>

          {/* Rayo de escaneo láser morado */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#7C6CF2]/70 to-transparent animate-scan" />
        </div>

        {/* Título de procesamiento */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center justify-center gap-2 text-[#7C6CF2]">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-headings font-extrabold text-[10px] uppercase tracking-widest bg-[#7C6CF2]/10 px-2 py-0.5 rounded">
              IA Procesando
            </span>
          </div>
          <h3 className="font-headings font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">
            Diseñando tu Documento Escolar
          </h3>
        </div>

        {/* Carrusel de micro-textos */}
        <div className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 min-h-[80px] flex items-center justify-center">
          <p className={`text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed transition-opacity duration-300 ${
            fade ? "opacity-100" : "opacity-0"
          }`}>
            {MICRO_TEXTS[textIndex]}
          </p>
        </div>

        {/* Indicador de progreso circular discreto */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
          <span className="w-3 h-3 border-2 border-[#7C6CF2] border-t-transparent rounded-full animate-spin" />
          <span>Generando estructura .docx</span>
        </div>

      </div>
    </div>
  );
}
