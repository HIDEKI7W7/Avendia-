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
    icon: <MessageSquare className="w-5 h-5 text-[#7C6CF2]" />,
    titulo: "Enseña con IA",
    descripcion: "Conversa con tus alumnos y explica conceptos de forma dinámica.",
  },
  {
    icon: <ClipboardCheck className="w-5 h-5 text-[#FF7657]" />,
    titulo: "Evalúa fácilmente",
    descripcion: "Crea exámenes interactivos y recibe retroalimentación automática.",
  },
  {
    icon: <UserPlus className="w-5 h-5 text-emerald-500" />,
    titulo: "Invita estudiantes",
    descripcion: "Comparte tu sala y sigue el progreso de cada estudiante en tiempo real.",
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
    <div className="bg-white border border-[#E8EDF3] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_4px_12px_rgba(30,41,59,0.01)] hover:shadow-[0_12px_36px_rgba(74,90,226,0.06)] hover:scale-[1.02] transition-all duration-300 ease-in-out group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 w-fit text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.bgBadge}`}
          >
            {meta.icon}
            {meta.label}
          </span>
          <h3 className="font-headings font-bold text-sm text-slate-900 leading-tight mt-1 truncate group-hover:text-morado-ia transition-colors duration-300">
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
      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {sala.sesionesActivas} sesiones
        </span>
        <span className="capitalize">{sala.dificultad}</span>
        <span>{sala.numPreguntas} preg.</span>
      </div>

      {/* Código de acceso */}
      <div className="flex items-center justify-between bg-slate-50 border border-[#E8EDF3] rounded-xl px-3 py-2.5">
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Código de acceso
          </span>
          <span className="font-mono font-bold text-sm text-slate-800 tracking-widest">
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
              <span className="text-emerald-500">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </>
          )}
        </button>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#7C6CF2]/8 hover:bg-[#7C6CF2]/15 text-[#7C6CF2] text-[11px] font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir sala
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-[11px] font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">

      {/* ── Toast de éxito ── */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-200 animate-in slide-in-from-right-4 duration-300">
          <Check className="w-4 h-4 shrink-0" />
          <span className="text-sm font-bold">¡Sala creada con éxito!</span>
        </div>
      )}

      {/* ── Cabecera de página ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headings font-black text-2xl text-slate-900 tracking-tight leading-tight">
            Salas AVENDIA
          </h1>
          <p className="text-sm text-slate-500 font-body mt-0.5">
            Espacios interactivos con IA para tus estudiantes
          </p>
        </div>

        {/* Badge cuota */}
        <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-full whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5" />
          Plan gratuito · {salasUsadas} de {salasTotal} sala
        </span>
      </div>

      {/* ── Banner informativo de características ── */}
      <div className="bg-white border border-[#E8EDF3] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {CARACTERISTICAS.map((c) => (
            <div key={c.titulo} className="flex items-start gap-3 pt-4 sm:pt-0 first:pt-0 sm:px-5 first:sm:pl-0 last:sm:pr-0 group">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300">
                {c.icon}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-headings font-black text-sm text-slate-800 leading-tight group-hover:text-morado-ia transition-colors duration-300">
                  {c.titulo}
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
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
            <span className="text-xs font-bold text-slate-500">
              {salas.length} sala{salas.length !== 1 ? "s" : ""} activa{salas.length !== 1 ? "s" : ""}
            </span>
            <Link
              href="/dashboard/salas/crear"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF7657] text-white text-xs font-black hover:bg-[#e86646] transition-all duration-300 shadow-[0_4px_12px_rgba(255,118,87,0.2)] hover:shadow-[0_6px_16px_rgba(255,118,87,0.3)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
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
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#E8EDF3] rounded-3xl py-20 px-8 gap-5 text-center bg-white/50 hover:bg-white transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <FolderOpen className="w-8 h-8 text-slate-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="font-headings font-black text-lg text-slate-800">
              Aún no tienes salas
            </h2>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Crea tu primera sala interactiva con IA y empieza a evaluar a tus estudiantes
              de forma dinámica y automatizada.
            </p>
          </div>

          <Link
            href="/dashboard/salas/crear"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7657] hover:bg-[#e86646] active:scale-95 text-white text-sm font-black transition-all duration-300 shadow-[0_4px_14px_rgba(255,118,87,0.25)] hover:shadow-[0_6px_20px_rgba(255,118,87,0.35)] hover:scale-[1.02] cursor-pointer"
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
