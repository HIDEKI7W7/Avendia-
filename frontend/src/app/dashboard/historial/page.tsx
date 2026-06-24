"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  FileText,
  BookOpen,
  ClipboardList,
  Calendar,
  MoreVertical,
  Eye,
  Trash2,
  Download,
  Copy,
  Loader2,
  FileSearch,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import { BACKEND_URL } from "@/config/api";

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════
interface Documento {
  id: string;
  titulo: string;
  herramienta: string;
  fechaCreacion: string; // ISO string
}

interface ApiDocumento {
  id: string;
  title: string;
  document_type: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES DE FILTROS
// ═══════════════════════════════════════════════════════════════════════════
const CATEGORIAS = ["Todas", "Planificación", "Evaluación", "Asistencia", "Comunicados"];

const HERRAMIENTAS: Record<string, string[]> = {
  Todas: ["Todas"],
  Planificación: [
    "Todas",
    "Plan Curricular Anual",
    "Unidad de Aprendizaje",
    "Sesión de Aprendizaje",
    "Plan de Desarrollo Curricular",
  ],
  Evaluación: ["Todas", "Rúbrica de Evaluación", "Lista de Cotejo", "Ficha de Aprendizaje"],
  Asistencia: ["Todas", "Registro de Asistencia"],
  Comunicados: ["Todas", "Informe Pedagógico", "Acta Escolar"],
};

const FECHAS = [
  { label: "Más recientes", value: "desc" },
  { label: "Más antiguos", value: "asc" },
  { label: "Este mes", value: "month" },
  { label: "Esta semana", value: "week" },
];

const DOC_TYPE_META: Record<
  string,
  { categoria: string; herramienta: string; icon: React.ReactNode; iconBg: string }
> = {
  "Plan Curricular Anual": {
    categoria: "Planificación",
    herramienta: "Plan Curricular Anual",
    icon: <Calendar className="w-4 h-4 text-emerald-600" />,
    iconBg: "bg-emerald-50 border-emerald-100",
  },
  "Unidad de Aprendizaje": {
    categoria: "Planificación",
    herramienta: "Unidad de Aprendizaje",
    icon: <BookOpen className="w-4 h-4 text-blue-600" />,
    iconBg: "bg-blue-50 border-blue-100",
  },
  "Sesión de Aprendizaje": {
    categoria: "Planificación",
    herramienta: "Sesión de Aprendizaje",
    icon: <FileText className="w-4 h-4 text-rose-600" />,
    iconBg: "bg-rose-50 border-rose-100",
  },
  "Plan de Desarrollo Curricular": {
    categoria: "Planificación",
    herramienta: "Plan de Desarrollo Curricular",
    icon: <ClipboardList className="w-4 h-4 text-[#7C6CF2]" />,
    iconBg: "bg-violet-50 border-violet-100",
  },
};

const DEFAULT_META = {
  categoria: "General",
  herramienta: "Documento",
  icon: <FileText className="w-4 h-4 text-slate-500" />,
  iconBg: "bg-slate-50 border-slate-100",
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function formatFecha(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getMeta(documentType: string) {
  return DOC_TYPE_META[documentType] ?? DEFAULT_META;
}

function isThisWeek(isoString: string): boolean {
  const now = new Date();
  const d = new Date(isoString);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

function isThisMonth(isoString: string): boolean {
  const now = new Date();
  const d = new Date(isoString);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ═══════════════════════════════════════════════════════════════════════════
// SELECT ESTILIZADO CON ESTILOS BENTO
// ═══════════════════════════════════════════════════════════════════════════
interface StyledSelectProps {
  label: string;
  options: string[] | { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  customClass?: string;
}

function StyledSelect({ label, options, value, onChange, customClass = "" }: StyledSelectProps) {
  const isObject = (o: unknown): o is { label: string; value: string } =>
    typeof o === "object" && o !== null && "label" in o && "value" in o;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold rounded-xl outline-none border border-transparent transition-all duration-300 cursor-pointer min-w-[130px] hover:scale-[1.01] ${customClass}`}
        aria-label={label}
      >
        {options.map((opt) => {
          if (isObject(opt)) {
            return (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {opt.label}
              </option>
            );
          }
          return (
            <option key={opt as string} value={opt as string} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
              {opt as string}
            </option>
          );
        })}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-80" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MENÚ DE FILA DE DOCUMENTO
// ═══════════════════════════════════════════════════════════════════════════
interface RowMenuProps {
  docId: string;
  onDelete: (id: string) => void;
}

function RowMenu({ docId, onDelete }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Más opciones"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 w-44 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer text-left"
            onClick={() => {
              alert("Archivo descargado correctamente.");
              setOpen(false);
            }}
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Descargar
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer text-left"
            onClick={() => {
              alert("Documento clonado.");
              setOpen(false);
            }}
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            Clonar
          </button>
          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left"
            onClick={() => {
              setOpen(false);
              onDelete(docId);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FILA DE DOCUMENTO REESTILIZADA
// ═══════════════════════════════════════════════════════════════════════════
interface DocumentRowProps {
  doc: Documento;
  onDelete: (id: string) => void;
}

function DocumentRow({ doc, onDelete }: DocumentRowProps) {
  const meta = getMeta(doc.herramienta);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_160px_auto] items-center gap-4 px-6 py-4 bg-white/40 dark:bg-slate-900/30 hover:bg-gradient-to-r hover:from-[#7C6CF2]/5 hover:to-transparent border-b border-slate-100/50 dark:border-slate-800/40 last:border-b-0 transition-all duration-300 rounded-2xl group my-1">
      {/* Columna: Título */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 ${meta.iconBg}`}
        >
          {meta.icon}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-headings font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate leading-tight group-hover:text-morado-ia transition-colors duration-300">
            {doc.titulo}
          </span>
          <span className="md:hidden text-[10px] text-slate-500 font-semibold">{doc.herramienta}</span>
        </div>
      </div>

      {/* Columna: Herramienta */}
      <span className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">
        {doc.herramienta}
      </span>

      {/* Columna: Fecha */}
      <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
        <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        {formatFecha(doc.fechaCreacion)}
      </span>

      {/* Acciones */}
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={() => alert(`Previsualizando "${doc.titulo}"`)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FF7657] hover:bg-[#e86646] active:scale-[0.97] hover:scale-[1.02] text-white text-[10px] font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-md shadow-[#FF7657]/20"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Visualizar</span>
        </button>
        <RowMenu docId={doc.id} onDelete={onDelete} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// ═══════════════════════════════════════════════════════════════════════════
interface DeleteModalProps {
  docTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({ docTitle, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 p-6 w-full max-w-sm flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/10 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-headings font-black text-sm text-slate-900 dark:text-white leading-tight">
              Eliminar documento
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight font-semibold">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl px-4 py-3 leading-relaxed">
          ¿Estás seguro de que deseas eliminar{" "}
          <span className="font-bold text-slate-800 dark:text-white">&ldquo;{docTitle}&rdquo;</span>?
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.97] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function HistorialPage() {
  const router = useRouter();

  // ── Estado de datos ──────────────────────────────────────────────────────
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── Estado de filtros ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todas");
  const [herramientaFiltro, setHerramientaFiltro] = useState<string>("Todas");
  const [fechaFiltro, setFechaFiltro] = useState<string>("desc");

  // ── Estado de delete modal ───────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Documento | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // ── Carga inicial desde el backend ──────────────────────────────────────
  const fetchDocumentos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${BACKEND_URL}/api/v1/documents/?order=${fechaFiltro}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("No se pudo cargar el historial.");

      const data: ApiDocumento[] = await res.json();
      const mapped: Documento[] = data.map((d) => ({
        id: d.id,
        titulo: d.title,
        herramienta: d.document_type,
        fechaCreacion: d.created_at,
      }));
      setDocumentos(mapped);
    } catch (e) {
      setError((e as Error).message ?? "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [fechaFiltro]);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  // ── Confirmación de borrado ──────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${BACKEND_URL}/api/v1/documents/${deleteTarget.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok && res.status !== 204) throw new Error("No se pudo eliminar.");
      setDocumentos((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch {
      // silencioso — el documento se mantendrá en pantalla
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ── Filtrado client-side ─────────────────────────────────────────────────
  const herramientasDisponibles = HERRAMIENTAS[categoriaFiltro] ?? ["Todas"];

  const docsFiltrados = documentos.filter((doc) => {
    const meta = getMeta(doc.herramienta);

    // Búsqueda por título
    if (searchQuery && !doc.titulo.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Categoría
    if (categoriaFiltro !== "Todas" && meta.categoria !== categoriaFiltro) return false;
    // Herramienta
    if (herramientaFiltro !== "Todas" && doc.herramienta !== herramientaFiltro) return false;
    // Fecha
    if (fechaFiltro === "week" && !isThisWeek(doc.fechaCreacion)) return false;
    // mes
    if (fechaFiltro === "month" && !isThisMonth(doc.fechaCreacion)) return false;

    return true;
  });

  const resetFiltros = () => {
    setCategoriaFiltro("Todas");
    setHerramientaFiltro("Todas");
    setFechaFiltro("desc");
    setSearchQuery("");
  };

  return (
    <>
      {/* Estilos locales para animaciones personalizadas */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12 font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">

        {/* ── CABECERA Y FILTROS BENTO GRID (Bento Navigation Card) ── */}
        <div className="rounded-3xl bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 p-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 transition-all duration-300">
          <div className="flex flex-col gap-1 flex-1">
            <h1 className="font-montserrat font-black text-3xl text-slate-900 dark:text-white tracking-tight leading-tight">
              Historial de documentos
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Revisa, descarga y gestiona todos los documentos curriculares que has generado en Avendia.
            </p>
          </div>

          {/* Buscador Inteligente Glassmorphism */}
          <div className="relative min-w-[220px] group">
            <Search className="w-4 h-4 text-slate-450 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-[#7C6CF2] transition-colors duration-300" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-white placeholder:text-slate-450 bg-white/75 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#7C6CF2] focus:ring-4 focus:ring-[#7C6CF2]/10 transition-all duration-300"
            />
          </div>
        </div>

        {/* ── SECCIÓN DE BENTO CHIPS PARA FILTROS ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chip 'Todos' - Resets filters */}
          <button
            onClick={resetFiltros}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
              categoriaFiltro === "Todas" && herramientaFiltro === "Todas" && searchQuery === ""
                ? "bg-[#7C6CF2]/12 text-[#7C6CF2] dark:text-[#9A8DFF] border border-[#7C6CF2]/20"
                : "bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Todos</span>
          </button>

          {/* Chip 'Por Categoría' (Celeste) */}
          <div className="bg-[#7DD3FC]/8 dark:bg-[#7DD3FC]/15 text-[#4A90E2] dark:text-[#7DD3FC] rounded-xl border border-sky-100/30 flex items-center gap-2 px-1">
            <StyledSelect
              label="Por Categoría"
              options={CATEGORIAS}
              value={categoriaFiltro}
              onChange={(v) => {
                setCategoriaFiltro(v);
                setHerramientaFiltro("Todas");
              }}
              customClass="bg-transparent text-[#4A90E2] dark:text-[#7DD3FC]"
            />
          </div>

          {/* Chip 'Por Herramienta' (Verde) */}
          <div className="bg-[#34D399]/8 dark:bg-[#34D399]/15 text-[#34D399] rounded-xl border border-emerald-100/30 flex items-center gap-2 px-1">
            <StyledSelect
              label="Por Herramienta"
              options={herramientasDisponibles}
              value={herramientaFiltro}
              onChange={setHerramientaFiltro}
              customClass="bg-transparent text-[#34D399]"
            />
          </div>

          {/* Selector Fecha */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center px-1 border border-slate-150 dark:border-slate-800">
            <StyledSelect
              label="Fecha"
              options={FECHAS}
              value={fechaFiltro}
              onChange={setFechaFiltro}
              customClass="bg-transparent text-slate-600 dark:text-slate-400"
            />
          </div>

          {/* Contador de Resultados */}
          {!isLoading && (
            <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
              {docsFiltrados.length}{" "}
              {docsFiltrados.length === 1 ? "documento encontrado" : "documentos encontrados"}
            </span>
          )}
        </div>

        {/* ── 2. SECCIÓN DE DOCUMENTOS / EMPTY STATE ── */}
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl p-6 shadow-xl min-h-[380px] flex flex-col justify-center transition-colors duration-300">

          {/* ── Estado: Cargando ── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#7C6CF2] animate-spin" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Cargando historial de documentos...
              </span>
            </div>
          )}

          {/* ── Estado: Error ── */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-headings font-bold text-sm text-slate-800 dark:text-white">
                  Error al cargar documentos
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{error}</p>
              </div>
              <button
                onClick={fetchDocumentos}
                className="px-4 py-2 rounded-xl bg-[#7C6CF2] hover:bg-[#6858E0] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* ── Estado: Sin resultados / Historial vacío (Ingravidez Kawaii) ── */}
          {!isLoading && !error && docsFiltrados.length === 0 && (
            <div className="bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#7C6CF2]/15 via-[#7DD3FC]/5 to-transparent dark:from-[#7C6CF2]/10 dark:via-slate-900 dark:to-slate-950 border border-white/10 dark:border-slate-850/20 rounded-[2.5rem] p-8 sm:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-inner max-w-3xl mx-auto w-full">
              
              {/* Previsualización de Documento Widget Flotante */}
              <div className="absolute bottom-10 right-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/30 dark:border-slate-800 rounded-2xl p-4 shadow-2xl w-32 aspect-[1/1.414] text-left hidden lg:flex flex-col gap-2 rotate-6 hover:rotate-0 transition-transform duration-500 ease-out select-none">
                <div className="w-8 h-2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="w-10/12 h-1 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="w-11/12 h-1 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="w-9/12 h-1 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="mt-auto text-[8px] font-bold text-[#7C6CF2]/70 dark:text-[#9A8DFF] uppercase tracking-widest text-center animate-pulse">
                  Cargando...
                </div>
              </div>

              {/* Floating elements surrounding character */}
              <div className="relative w-48 h-48 flex items-center justify-center select-none">
                <div className="absolute top-2 left-2 text-2xl opacity-60 animate-float" style={{ animationDelay: "0.2s" }}>📄</div>
                <div className="absolute top-10 right-2 text-xl opacity-50 animate-float" style={{ animationDelay: "1s" }}>📂</div>
                <div className="absolute bottom-6 left-4 text-lg opacity-45 animate-float" style={{ animationDelay: "1.8s" }}>📎</div>
                <div className="absolute bottom-10 right-6 text-xl opacity-60 animate-float" style={{ animationDelay: "2.6s" }}>📝</div>

                {/* Personaje Adorable Kawaii (Teacher Mascot) */}
                <img 
                  src="/teacher_loading_asset.png" 
                  alt="Mascota Docente Kawaii" 
                  className="w-36 h-36 object-contain drop-shadow-[0_12px_24px_rgba(124,108,242,0.25)] animate-float"
                  style={{ animationDuration: "5s" }}
                />
              </div>

              {/* Dialog bubble */}
              <div className="relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl px-6 py-3.5 shadow-[0_10px_30px_rgba(124,108,242,0.06)] max-w-xs text-center text-xs font-bold text-slate-800 dark:text-slate-200 mt-4 leading-relaxed after:absolute after:top-[-8px] after:left-1/2 after:-translate-x-1/2 after:border-l-8 after:border-l-transparent after:border-r-8 after:border-r-transparent after:border-b-8 after:border-b-white dark:after:border-b-slate-900 shadow-xl">
                «¡Profe! Tu historial está listo para llenarse de magia pedagógica. ✨»
              </div>

              {/* Floating Carpeta Rediseñada */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#7C6CF2]/15 to-[#7DD3FC]/15 flex items-center justify-center text-[#7C6CF2] dark:text-[#7DD3FC] shadow-lg animate-float mt-8 select-none">
                <FileSearch className="w-7 h-7 text-[#7C6CF2]" />
              </div>

              {/* Botón de Acción Principal (+ Crear mi primer documento) */}
              <button
                onClick={() => router.push("/dashboard/chat")}
                className="mt-6 py-4 px-8 rounded-2xl bg-gradient-to-r from-[#4A90E2] to-[#7C6CF2] text-white font-headings font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-[#7C6CF2]/25 hover:brightness-105 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer animate-pulse"
                style={{ animationDuration: "3s" }}
              >
                + Crear mi primer documento
              </button>
            </div>
          )}

          {/* ── Filas de datos (Tabla de Documentos) ── */}
          {!isLoading && !error && docsFiltrados.length > 0 && (
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-300">
              {/* Cabecera de tabla visible en pantallas md+ */}
              <div className="hidden md:grid grid-cols-[1fr_220px_160px_auto] items-center gap-4 px-6 py-2.5 bg-slate-50/20 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/40 rounded-xl mb-1 select-none">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Título del Documento
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Herramienta IA
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Fecha de creación
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right pr-6">
                  Acciones
                </span>
              </div>

              {docsFiltrados.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  onDelete={(id) => {
                    const target = documentos.find((d) => d.id === id);
                    if (target) setDeleteTarget(target);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL DE CONFIRMACIÓN ── */}
      {deleteTarget && (
        <DeleteModal
          docTitle={deleteTarget.titulo}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
