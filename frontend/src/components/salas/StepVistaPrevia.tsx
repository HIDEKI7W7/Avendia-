"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Tag,
  FileText,
  HelpCircle,
  BarChart2,
  ScrollText,
  LinkIcon,
  Signal,
  Wifi,
  Battery,
  Send,
} from "lucide-react";
import {
  SalaConfig,
  TIPO_LABELS,
  ORIGEN_LABELS,
  DIFICULTAD_LABELS,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4 — RESUMEN + SIMULACIÓN DE CARGA / VISTA PREVIA
// ═══════════════════════════════════════════════════════════════════════════

interface MetaRow {
  icon: React.ReactNode;
  label: string;
  value: string;
  colSpan: string;
}

interface StepVistaPreviaProps {
  config: SalaConfig;
  isCreating: boolean;
}

const CAROUSEL_TEXTS = [
  "🤖 Preparando la IA de evaluación...",
  "✨ Generando preguntas dinámicas...",
  "✍️ Configurando criterios de rúbrica...",
  "🚀 Activando sala para los estudiantes...",
];

export default function StepVistaPrevia({
  config,
  isCreating,
}: StepVistaPreviaProps) {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (!isCreating) return;
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % CAROUSEL_TEXTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isCreating]);

  const metaRows: MetaRow[] = [
    {
      icon: <Tag className="w-3.5 h-3.5 text-[#7C6CF2]" />,
      label: "Nombre",
      value: config.nombre || "—",
      colSpan: "col-span-2",
    },
    {
      icon: <FileText className="w-3.5 h-3.5 text-[#FF7657]" />,
      label: "Tipo",
      value: TIPO_LABELS[config.tipo],
      colSpan: "col-span-1",
    },
    {
      icon: <ScrollText className="w-3.5 h-3.5 text-blue-500" />,
      label: "Fuente",
      value: ORIGEN_LABELS[config.origenContenido],
      colSpan: "col-span-1",
    },
    {
      icon: <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />,
      label: "Preguntas",
      value: `${config.numPreguntas} preguntas`,
      colSpan: "col-span-1",
    },
    {
      icon: <BarChart2 className="w-3.5 h-3.5 text-amber-500" />,
      label: "Dificultad",
      value: DIFICULTAD_LABELS[config.dificultad],
      colSpan: "col-span-1",
    },
    {
      icon: <LinkIcon className="w-3.5 h-3.5 text-slate-400" />,
      label: "Aula",
      value: config.aulaVinculadaId ? "Aula Vinculada" : "Abierta (sin aula)",
      colSpan: "col-span-2",
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Encabezado */}
      <div>
        <h3 className="font-headings font-black text-lg text-slate-800 dark:text-white leading-tight">
          Vista previa y confirmación
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Revisa la configuración de tu sala antes de crearla. Puedes volver atrás para ajustar
          cualquier parámetro.
        </p>
      </div>

      {/* Layout dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* ── Columna Izquierda: Resumen Bento ── */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">
            Resumen de configuración
          </span>

          <div className="grid grid-cols-2 gap-3.5">
            {metaRows.map((row) => (
              <div
                key={row.label}
                className={`${row.colSpan} bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-2xl shadow-[0_4px_12px_rgba(30,41,59,0.01)] hover:shadow-[0_8px_20px_rgba(124,108,242,0.04)] hover:scale-[1.01] transition-all duration-300 flex flex-col gap-1.5 min-w-0`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shrink-0 shadow-sm border border-slate-100 dark:border-slate-850">
                    {row.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                    {row.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug break-words">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Instrucciones (Bento independiente) */}
          {config.instruccionesEstudiante && (
            <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl shadow-[0_4px_12px_rgba(30,41,59,0.01)] flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Instrucciones para el Alumno
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-4 font-medium">
                {config.instruccionesEstudiante}
              </p>
            </div>
          )}
        </div>

        {/* ── Columna Derecha: Vista previa / Simulador de Celular ── */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-3 self-start">
            Vista previa del dispositivo del alumno
          </span>

          {/* Simulador de celular físico en modo oscuro elegante */}
          <div className="relative w-full max-w-[290px] bg-slate-950 rounded-[44px] p-3 border-[6px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden aspect-[9/18.5] flex flex-col select-none">
            {/* Notch del celular */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center gap-1.5">
              <div className="w-10 h-1 bg-slate-900 rounded-full" />
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
            </div>

            {/* Barra de estado del celular */}
            <div className="flex justify-between items-center px-4 pt-3 pb-1 text-[8px] font-mono text-slate-450 select-none z-20 font-bold">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-2.5 h-2.5" />
                <Wifi className="w-2.5 h-2.5" />
                <Battery className="w-3.5 h-2.5 text-slate-400" />
              </div>
            </div>

            {/* Pantalla del celular */}
            <div className="flex-1 rounded-[32px] overflow-hidden bg-slate-900/40 relative flex flex-col">
              {isCreating ? (
                /* ── MOCKUP DE CARGA VIVA CON MASCOTA FLOTANTE ── */
                <div className="flex-1 flex flex-col items-center justify-center p-5 text-center relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-[#7C6CF2]/15">
                  {/* Aura mágica / halo de luz de fondo */}
                  <div className="absolute w-36 h-36 rounded-full bg-[#7C6CF2]/10 blur-2xl top-1/3 left-1/2 -translate-x-1/2 animate-pulse" />
                  
                  {/* Contenedor del personaje flotante */}
                  <div className="relative z-10 w-28 h-28 mb-4 flex items-center justify-center">
                    {/* Chispas y estrellas mágicas rotando */}
                    <div className="absolute inset-0 border border-[#7C6CF2]/20 rounded-full animate-[spin_8s_linear_infinite]" />
                    <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 left-4 animate-ping" />
                    <Sparkles className="w-3.5 h-3.5 text-[#7C6CF2] absolute -bottom-2 right-4 animate-pulse" />
                    <Sparkles className="w-4 h-4 text-sky-300 absolute top-8 -left-2 animate-bounce" />
                    
                    <img
                      src="/teacher_loading_asset.png"
                      alt="Profesor Kawaii Creando"
                      className="w-24 h-24 object-contain animate-[bounce_4s_infinite] relative z-10"
                      style={{ animationDuration: '4s' }}
                    />
                  </div>

                  {/* Textos rotativos de progreso */}
                  <div className="relative z-10 flex flex-col gap-2 max-w-[200px]">
                    <span className="text-[10px] font-black tracking-widest text-[#7C6CF2] uppercase animate-pulse">
                      Configurando
                    </span>
                    <p className="text-[11px] font-bold text-white leading-tight min-h-[30px] flex items-center justify-center">
                      {CAROUSEL_TEXTS[textIndex]}
                    </p>
                    <div className="flex gap-1 justify-center mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7C6CF2] animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7C6CF2] animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7C6CF2] animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              ) : (
                /* ── MOCKUP DE CHAT/EXAMEN NORMAL ── */
                <>
                  {/* Header de la App simulada */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border-b border-slate-900">
                    <div className="w-6 h-6 rounded-full bg-[#7C6CF2]/10 border border-[#7C6CF2]/30 flex items-center justify-center text-[9px] font-black text-[#7C6CF2]">
                      A
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-100 leading-none">AVENDIA IA</p>
                      <p className="text-[8px] text-slate-400 truncate mt-0.5 max-w-[120px]">
                        {config.nombre || "Mi Sala"}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[7px] text-emerald-400 font-bold">Activa</span>
                    </div>
                  </div>

                  {/* Historial de conversación simulada */}
                  <div className="flex-1 flex flex-col p-3 gap-3 bg-slate-950 overflow-y-auto min-h-[220px]">
                    
                    {/* Mensaje de bienvenida de la IA */}
                    <div className="flex items-start gap-1.5 max-w-[85%] self-start">
                      <div className="w-5 h-5 rounded-full bg-[#7C6CF2] flex items-center justify-center text-white text-[8px] font-black shrink-0 mt-0.5">
                        A
                      </div>
                      <div className="bg-[#7C6CF2]/10 border border-[#7C6CF2]/20 rounded-2xl rounded-tl-sm px-2.5 py-2 text-[10px] text-slate-200 leading-relaxed font-semibold">
                        ¡Hola! Soy tu asistente de evaluación.{" "}
                        {config.instruccionesEstudiante
                          ? config.instruccionesEstudiante.length > 55
                            ? config.instruccionesEstudiante.slice(0, 55) + "..."
                            : config.instruccionesEstudiante
                          : "Estoy listo para comenzar la sesión. ¿Empezamos?"}
                      </div>
                    </div>

                    {/* Mensaje simulado del alumno */}
                    <div className="flex flex-col gap-1 max-w-[85%] self-end">
                      <div className="bg-slate-900 text-slate-300 rounded-2xl rounded-tr-sm px-3 py-2 text-[10px] leading-relaxed font-medium">
                        ¡Hola! Estoy listo para el examen.
                      </div>
                    </div>
                  </div>

                  {/* Barra de input del alumno */}
                  <div className="mt-auto p-2 bg-slate-950 border-t border-slate-900/60">
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5">
                      <span className="text-[10px] text-slate-500 flex-1 truncate">
                        Escribe tu respuesta...
                      </span>
                      <button type="button" className="w-5 h-5 rounded-full bg-[#7C6CF2]/15 flex items-center justify-center text-[#7C6CF2]">
                        <Send className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Barra de inicio del celular */}
            <div className="w-24 h-1 bg-slate-800 mx-auto mt-2 rounded-full z-20 shrink-0" />
          </div>
        </div>
      </div>

      {/* Nota final */}
      <div className="bg-[#7C6CF2]/5 border border-[#7C6CF2]/10 rounded-2xl px-4 py-3 text-[11px] text-[#7C6CF2] font-semibold leading-relaxed flex items-start gap-2.5 shadow-sm mt-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#7C6CF2]" />
        <span>
          Al crear la sala, recibirás un código de acceso único para compartir con tus estudiantes.
          Podrán unirse sin necesidad de una cuenta en AVENDIA.
        </span>
      </div>
    </div>
  );
}
