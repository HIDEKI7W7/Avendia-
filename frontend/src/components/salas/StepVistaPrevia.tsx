"use client";

import React from "react";
import {
  Sparkles,
  Loader2,
  Tag,
  FileText,
  HelpCircle,
  BarChart2,
  ScrollText,
  LinkIcon,
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
}

interface StepVistaPreviaProps {
  config: SalaConfig;
  isCreating: boolean;
}

export default function StepVistaPrevia({
  config,
  isCreating,
}: StepVistaPreviaProps) {
  const metaRows: MetaRow[] = [
    {
      icon: <Tag className="w-3.5 h-3.5 text-[#7C6CF2]" />,
      label: "Nombre",
      value: config.nombre || "—",
    },
    {
      icon: <FileText className="w-3.5 h-3.5 text-[#FF7657]" />,
      label: "Tipo",
      value: TIPO_LABELS[config.tipo],
    },
    {
      icon: <ScrollText className="w-3.5 h-3.5 text-blue-500" />,
      label: "Fuente",
      value: ORIGEN_LABELS[config.origenContenido],
    },
    {
      icon: <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />,
      label: "Preguntas",
      value: `${config.numPreguntas} preguntas`,
    },
    {
      icon: <BarChart2 className="w-3.5 h-3.5 text-amber-500" />,
      label: "Dificultad",
      value: DIFICULTAD_LABELS[config.dificultad],
    },
    {
      icon: <LinkIcon className="w-3.5 h-3.5 text-slate-400" />,
      label: "Aula",
      value: config.aulaVinculadaId ?? "Abierta (sin aula)",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <h3 className="font-headings font-black text-lg text-slate-900 leading-tight">
          Vista previa y confirmación
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Revisa la configuración de tu sala antes de crearla. Puedes volver atrás para ajustar
          cualquier parámetro.
        </p>
      </div>

      {/* Layout dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Columna Izquierda: Resumen ── */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
            Resumen de configuración
          </span>

          <div className="flex flex-col divide-y divide-slate-100">
            {metaRows.map((row) => (
              <div
                key={row.label}
                className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="mt-0.5 shrink-0">{row.icon}</div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                    {row.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 leading-snug break-words">
                    {row.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Instrucciones (truncadas) */}
          {config.instruccionesEstudiante && (
            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instrucciones
              </span>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {config.instruccionesEstudiante}
              </p>
            </div>
          )}
        </div>

        {/* ── Columna Derecha: Vista previa del chat del alumno ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          {/* Header del chat simulado */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-[#7C6CF2] text-white">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
              A
            </div>
            <div>
              <p className="text-xs font-bold leading-none">AVENDIA IA</p>
              <p className="text-[9px] text-white/70 mt-0.5">
                {config.nombre || "Sala sin nombre"}
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-white/70">En línea</span>
            </div>
          </div>

          {/* Área de mensajes simulada */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 bg-slate-50/50 min-h-[180px]">
            {isCreating ? (
              /* Spinner de carga durante la creación */
              <>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-[#7C6CF2]/20 border-t-[#7C6CF2] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#7C6CF2]" />
                  </div>
                </div>
                <div className="text-center flex flex-col gap-1">
                  <p className="font-headings font-bold text-sm text-slate-800">
                    La IA se está preparando...
                  </p>
                  <p className="text-[11px] text-slate-500 animate-pulse">
                    Generando el prompt de evaluación
                  </p>
                </div>
              </>
            ) : (
              /* Preview estática de cómo verá el alumno */
              <>
                <div className="w-full flex flex-col gap-2.5">
                  {/* Mensaje bienvenida simulado */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#7C6CF2] flex items-center justify-center text-white text-[9px] font-black shrink-0 mt-0.5">
                      A
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%] shadow-sm">
                      <p className="text-xs text-slate-700 leading-relaxed">
                        ¡Hola! Soy tu asistente de evaluación.{" "}
                        {config.instruccionesEstudiante
                          ? config.instruccionesEstudiante.slice(0, 60) + "..."
                          : "Estoy listo para comenzar la sesión. ¿Empezamos?"}
                      </p>
                    </div>
                  </div>

                  {/* Barra de input simulada */}
                  <div className="mt-auto flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-xs text-slate-400 flex-1">
                      Escribe tu respuesta...
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-[#7C6CF2]/10 flex items-center justify-center">
                      <Loader2 className="w-3 h-3 text-[#7C6CF2]" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nota final */}
      <div className="bg-[#7C6CF2]/5 border border-[#7C6CF2]/10 rounded-xl px-4 py-3 text-xs text-[#7C6CF2] font-medium leading-relaxed flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        Al crear la sala, recibirás un código de acceso único para compartir con tus estudiantes.
        Podrán unirse sin necesidad de una cuenta en AVENDIA.
      </div>
    </div>
  );
}
