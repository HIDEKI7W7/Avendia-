"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Compass } from "lucide-react";

interface GenerationLoadingProps {
  onComplete?: () => void;
}

const QUOTES = [
  {
    text: "La educación es el arma más poderosa que puedes usar para cambiar el mundo.",
    author: "Nelson Mandela",
  },
  {
    text: "Enseñar es aprender dos veces.",
    author: "Joseph Joubert",
  },
  {
    text: "Quien se atreve a enseñar nunca debe dejar de aprender.",
    author: "John Cotton Dana",
  },
  {
    text: "El arte supremo del maestro consiste en despertar el goce de la expresión creativa y del conocimiento.",
    author: "Albert Einstein",
  },
  {
    text: "La planificación no es pensar en decisiones futuras, sino en el futuro de las decisiones presentes.",
    author: "Peter Drucker",
  },
];

export default function GenerationLoading({ onComplete }: GenerationLoadingProps) {
  // ─── Estados ─────────────────────────────────────────────────────────────
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(20);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // ─── 1. Cronómetro Activo ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  // ─── 2. Barra de Progreso Dinámica ───────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(timer);
          return 98; // Se detiene antes del 100% hasta que termine el backend
        }
        // Incrementa gradualmente: más rápido al inicio, más lento al final
        const inc = prev < 50 ? 2 : prev < 80 ? 0.8 : 0.2;
        return parseFloat((prev + inc).toFixed(1));
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  // Simulación de finalización si pasan 60s (para fines demostrativos en UI, o cuando se dispare onComplete)
  useEffect(() => {
    if (seconds >= 60 && onComplete) {
      setProgress(100);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [seconds, onComplete]);

  // ─── 3. Rotación de Citas ────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Inicia desvanecimiento de salida
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        setFade(true); // Desvanecimiento de entrada
      }, 300);
    }, 6000); // Cambia cada 6 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-lg bg-white border border-[#E8EDF3] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 flex flex-col items-center gap-8 relative overflow-hidden font-body text-slate-800">
      {/* Glow superior */}
      <div className="absolute top-[-20%] left-[-20%] w-[120%] h-[40%] bg-gradient-to-b from-[#7C6CF2]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Ilustración de Carga (Branding AVENDIA) */}
      <div className="relative w-24 h-24 flex items-center justify-center mt-4">
        {/* Anillo exterior animado */}
        <div className="absolute inset-0 border-4 border-[#7C6CF2]/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-[#7C6CF2] rounded-full animate-spin" />
        {/* Círculo interno */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#4A90E2] to-[#7C6CF2] flex items-center justify-center shadow-md">
          <Compass className="w-7 h-7 text-white animate-pulse" />
        </div>
      </div>

      {/* Título de procesamiento */}
      <div className="text-center flex flex-col gap-1.5">
        <h2 className="font-headings font-bold text-xl text-slate-900 leading-tight">
          Construyendo tu Experiencia AVENDIA
        </h2>
        <p className="text-xs text-slate-500 font-body max-w-sm">
          Estamos calibrando el currículo nacional, adaptando los contextos de tus estudiantes y preparando tus primeros 7 créditos de regalo...
        </p>
      </div>

      {/* ─── 1. Cronómetro Digital ─── */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
          Tiempo Transcurrido
        </span>
        <span className="font-mono font-extrabold text-2xl text-slate-800 tracking-wider">
          {formatTime(seconds)}
        </span>
      </div>

      {/* ─── 2. Barra de Progreso ─── */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>Generando Workspace...</span>
          <span className="text-[#7C6CF2] font-mono">{Math.floor(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="h-full bg-gradient-to-r from-[#4A90E2] to-[#7C6CF2] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-semibold block text-right mt-0.5">
          Tiempo estimado: 2-4 minutos
        </span>
      </div>

      {/* ─── 3. Caja de Citas/Quotes Rotativas ─── */}
      <div className="w-full bg-[#FAF8F5] border border-[#F3EFE9] rounded-2xl p-5 flex gap-3.5 items-start mt-2">
        <div className="w-8 h-8 rounded-xl bg-[#F0ECE4] flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
          <Sparkles className="w-4.5 h-4.5" />
        </div>
        <div className="flex flex-col gap-1 min-h-[72px]">
          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">
            Sabiduría Pedagógica
          </span>
          <p
            className={`text-xs text-slate-700 italic leading-relaxed font-body transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            "{QUOTES[quoteIndex].text}"
          </p>
          <span
            className={`text-[10px] font-bold text-slate-500 mt-1 transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            — {QUOTES[quoteIndex].author}
          </span>
        </div>
      </div>
    </div>
  );
}
