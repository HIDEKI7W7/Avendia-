"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FolderOpen,
  MessageSquare,
  ClipboardCheck,
  UserPlus,
  Plus,
  ExternalLink,
  Users,
  Copy,
  MoreVertical,
  Sparkles,
  Check,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════
interface Sala {
  id: string;
  nombre: string;
  tipo: "chat" | "examen";
  numPreguntas: number;
  dificultad: string;
  codigo: string;
  creadaEn: string;
  sesionesActivas: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════
const CARACTERISTICAS = [
  {
    icon: <MessageSquare className="w-5 h-5" />,
    titulo: "Enseña con IA",
    descripcion: "Conversa con tus alumnos y explica conceptos de forma dinámica.",
    iconColor: "text-[#7C6CF2]",
    iconBg: "bg-[#7C6CF2]/10"
  },
  {
    icon: <ClipboardCheck className="w-5 h-5" />,
    titulo: "Evalúa fácilmente",
    descripcion: "Crea exámenes interactivos y recibe retroalimentación automática.",
    iconColor: "text-[#FF7657]",
    iconBg: "bg-[#FF7657]/10"
  },
  {
    icon: <UserPlus className="w-5 h-5" />,
    titulo: "Invita estudiantes",
    descripcion: "Comparte tu sala y sigue el progreso de cada estudiante en tiempo real.",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10"
  },
];

// ─── Sala card colores por tipo ────────────────────────────────────────────
const TIPO_META = {
  chat: {
    label: "Chat IA",
    bgBadge: "bg-[#7C6CF2]/10 text-[#7C6CF2]",
    icon: <MessageSquare className="w-3.5 h-3.5" />,
  },
  examen: {
    label: "Examen",
    bgBadge: "bg-[#FF7657]/10 text-[#FF7657]",
    icon: <ClipboardCheck className="w-3.5 h-3.5" />,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: CARD DE SALA ACTIVA
// ═══════════════════════════════════════════════════════════════════════════
interface SalaCardProps {
  sala: Sala;
}

function SalaCard({ sala }: SalaCardProps) {
  const [copied, setCopied] = useState(false);
  const meta = TIPO_META[sala.tipo];

  const handleCopy = () => {
    navigator.clipboard.writeText(sala.codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-[#E8EDF3] dark:border-slate-800/80 rounded-3xl p-5 flex flex-col gap-4 shadow-[0_4px_12px_rgba(30,41,59,0.01)] hover:shadow-[0_12px_36px_rgba(74,90,226,0.06)] hover:scale-[1.01] transition-all duration-350 ease-out group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 w-fit text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.bgBadge}`}
          >
            {meta.icon}
            {meta.label}
          </span>
          <h3 className="font-headings font-black text-sm text-slate-900 dark:text-white leading-tight mt-2 truncate group-hover:text-[#7C6CF2] transition-colors duration-300">
            {sala.nombre}
          </h3>
        </div>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 active:scale-90 shrink-0 cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold font-body">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {sala.sesionesActivas} sesiones
        </span>
        <span className="capitalize">{sala.dificultad}</span>
        <span>{sala.numPreguntas} preg.</span>
      </div>

      {/* Código de acceso */}
      <div className="flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40 border border-[#E8EDF3] dark:border-slate-800/80 rounded-2xl px-4 py-3">
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Código de acceso
          </span>
          <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200 tracking-widest">
            {sala.codigo}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-bold text-[#7C6CF2] hover:text-[#6359d1] transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-body">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-body">Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[#7C6CF2]/8 hover:bg-[#7C6CF2]/15 text-[#7C6CF2] text-[11px] font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir sala
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 text-slate-650 dark:text-slate-350 text-[11px] font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          Ver progreso
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — "MIS SALAS"
// ═══════════════════════════════════════════════════════════════════════════
function SalasPageContent() {
  const searchParams = useSearchParams();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Detectar redirect con sala_creada=1
  useEffect(() => {
    if (searchParams.get("sala_creada") === "1") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }
  }, [searchParams]);

  // TODO: fetch real de salas desde el backend cuando el endpoint esté listo
  // useEffect(() => { fetchSalas(); }, []);

  const hasRooms = salas.length > 0;

  // Cuota del plan (mock)
  const salasUsadas = salas.length;
  const salasTotal = 1; // Plan gratuito

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-2">

      {/* ── Toast de éxito ── */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-200 animate-in slide-in-from-right-4 duration-300">
          <Check className="w-4 h-4 shrink-0" />
          <span className="text-sm font-bold font-body">¡Sala creada con éxito!</span>
        </div>
      )}

      {/* ── Cabecera de página sin badge redundante ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight">
            Salas AVENDIA
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-450 font-body mt-1">
            Espacios interactivos con IA para tus estudiantes
          </p>
        </div>
      </div>

      {/* ── Banner informativo de características en Bento Grid y Glassmorphic ── */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-[#E8EDF3] dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_40px_rgba(124,108,242,0.02)] relative overflow-hidden">
        {/* Badge cuota flotante en la esquina superior derecha */}
        <span className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
          <Sparkles className="w-3 h-3" />
          Plan gratuito · {salasUsadas} de {salasTotal} sala
        </span>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 sm:mt-4">
          {CARACTERISTICAS.map((c) => (
            <div key={c.titulo} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl border border-slate-100/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/20 hover:border-[#7C6CF2]/30 hover:shadow-md transition-all duration-300 group text-center sm:text-left">
              <div className={`w-10 h-10 rounded-full ${c.iconBg} ${c.iconColor} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {c.icon}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-montserrat font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight group-hover:text-[#7C6CF2] transition-colors duration-300">
                  {c.titulo}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-body font-semibold">
                  {c.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Grid de salas o empty state ── */}
      {hasRooms ? (
        <>
          {/* Botón crear nueva sala cuando ya hay salas */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-body">
              {salas.length} sala{salas.length !== 1 ? "s" : ""} activa{salas.length !== 1 ? "s" : ""}
            </span>
            <Link
              href="/dashboard/salas/crear"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#4A90E2] to-[#7C6CF2] text-white text-xs font-headings font-black hover:brightness-110 transition-all duration-300 shadow-[0_4px_14px_rgba(124,108,242,0.25)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva sala
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {salas.map((sala) => (
              <SalaCard key={sala.id} sala={sala} />
            ))}
          </div>
        </>
      ) : (
        /* ── Empty State con Escena de Sala Flotante Kawaii ── */
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#E8EDF3] dark:border-slate-800 rounded-[2rem] py-16 px-8 gap-6 text-center bg-white/40 dark:bg-slate-900/20 hover:bg-white/70 dark:hover:bg-slate-900/40 transition-all duration-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_50px_rgba(124,108,242,0.04)]">
          {/* Ilustración Kawaii 3D Flotante */}
          <div className="relative w-48 h-48 group select-none flex items-center justify-center">
            {/* Halo background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7C6CF2]/8 via-[#4A90E2]/8 to-transparent rounded-full blur-2xl animate-pulse group-hover:scale-110 transition-transform duration-500" />
            <img
              src="/floating_classroom.png"
              alt="Sala Flotante Kawaii"
              className="w-40 h-40 object-contain relative z-10 animate-bounce"
              style={{ animationDuration: '6s' }}
            />
          </div>

          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-montserrat font-black text-lg text-slate-800 dark:text-slate-200">
              Aún no tienes salas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-relaxed font-semibold">
              Crea tu primera sala interactiva con IA y empieza a evaluar a tus estudiantes
              de forma dinámica, divertida y automatizada.
            </p>
          </div>

          <Link
            href="/dashboard/salas/crear"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#4A90E2] to-[#7C6CF2] hover:brightness-110 active:scale-95 text-white text-xs font-headings font-black transition-all duration-300 shadow-[0_8px_20px_rgba(124,108,242,0.3)] hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Crear mi primera sala
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SalasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#7C6CF2] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500 animate-pulse">Cargando salas...</p>
          </div>
        </div>
      }
    >
      <SalasPageContent />
    </Suspense>
  );
}
