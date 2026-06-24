"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

// Mapeo de tipo de documento → categoría, herramienta legible e ícono
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
// SUB-COMPONENTE: SELECT ESTILIZADO
// ═══════════════════════════════════════════════════════════════════════════
interface StyledSelectProps {
  label: string;
  options: string[] | { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}

function StyledSelect({ label, options, value, onChange }: StyledSelectProps) {
  const isObject = (o: unknown): o is { label: string; value: string } =>
    typeof o === "object" && o !== null && "label" in o && "value" in o;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-morado-ia focus:ring-4 focus:ring-morado-ia/10 transition-all duration-300 cursor-pointer hover:border-slate-300 min-w-[140px] hover:scale-[1.01]"
        aria-label={label}
      >
        {options.map((opt) => {
          if (isObject(opt)) {
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            );
          }
          return (
            <option key={opt as string} value={opt as string}>
              {opt as string}
            </option>
          );
        })}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: MENÚ CONTEXTUAL DE FILA
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
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Más opciones"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 w-44 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Descargar */}
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Descargar
          </button>
          {/* Clonar */}
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            Clonar
          </button>
          {/* Divisor */}
          <div className="my-1 border-t border-slate-100" />
          {/* Eliminar */}
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            onClick={() => {
              setOpen(false);
              onDelete(docId);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: FILA DE DOCUMENTO (tabla)
// ═══════════════════════════════════════════════════════════════════════════
interface DocumentRowProps {
  doc: Documento;
  onDelete: (id: string) => void;
}

function DocumentRow({ doc, onDelete }: DocumentRowProps) {
  const meta = getMeta(doc.herramienta);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_160px_auto] items-center gap-4 px-6 py-4.5 bg-white hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-all duration-300 border-b border-slate-100 last:border-b-0 group">
      {/* Columna: Título + Ícono */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 ${meta.iconBg}`}
        >
          {meta.icon}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-headings font-semibold text-sm text-slate-900 truncate leading-tight group-hover:text-morado-ia transition-colors duration-300">
            {doc.titulo}
          </span>
          {/* visible solo en mobile */}
          <span className="md:hidden text-[11px] text-slate-500">{doc.herramienta}</span>
        </div>
      </div>

      {/* Columna: Herramienta — oculta en mobile */}
      <span className="hidden md:block text-xs text-slate-500 truncate">{doc.herramienta}</span>

      {/* Columna: Fecha — oculta en mobile */}
      <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        {formatFecha(doc.fechaCreacion)}
      </span>

      {/* Acciones */}
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FF7657] hover:bg-[#e86646] active:scale-[0.97] hover:scale-[1.02] text-white text-[11px] font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(255,118,87,0.2)] hover:shadow-[0_6px_16px_rgba(255,118,87,0.3)]"
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
// SUB-COMPONENTE: TARJETA MOBILE (cuando md no aplica)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// MODAL DE CONFIRMACIÓN DE BORRADO
// ═══════════════════════════════════════════════════════════════════════════
interface DeleteModalProps {
  docTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({ docTitle, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#E8EDF3] p-6 w-full max-w-sm flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-headings font-black text-sm text-slate-900 leading-tight">
              Eliminar documento
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 leading-relaxed">
          ¿Estás seguro de que deseas eliminar{" "}
          <span className="font-bold text-slate-800">&ldquo;{docTitle}&rdquo;</span>?
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.97] transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 hover:shadow-[0_4px_12px_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-[0.97] text-white text-xs font-bold transition-all duration-300 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function DocumentosPage() {
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
    if (fechaFiltro === "month" && !isThisMonth(doc.fechaCreacion)) return false;

    return true;
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">

        {/* ── CABECERA DE PÁGINA ── */}
        <div className="flex flex-col gap-1">
          <h1 className="font-headings font-black text-2xl text-slate-900 tracking-tight leading-tight">
            Mis Documentos
          </h1>
          <p className="text-sm text-slate-500 font-body">
            Revisa, descarga y gestiona todos los documentos curriculares que has generado.
          </p>
        </div>

        {/* ── 1. BARRA DE FILTROS ── */}
        <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-3.5 rounded-3xl border border-[#E8EDF3] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[200px] group">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-morado-ia transition-colors duration-300" />
            <input
              type="text"
              placeholder="Buscar documento"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-morado-ia focus:ring-4 focus:ring-morado-ia/10 transition-all duration-300"
            />
          </div>

          {/* Divisor vertical */}
          <div className="hidden sm:block w-px h-6 bg-slate-100 mx-1" />

          {/* Etiqueta */}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:block">
            Filtrar por
          </span>

          {/* Selector: Categoría */}
          <StyledSelect
            label="Categoría"
            options={CATEGORIAS}
            value={categoriaFiltro}
            onChange={(v) => {
              setCategoriaFiltro(v);
              setHerramientaFiltro("Todas");
            }}
          />

          {/* Selector: Herramienta */}
          <StyledSelect
            label="Herramienta"
            options={herramientasDisponibles}
            value={herramientaFiltro}
            onChange={setHerramientaFiltro}
          />

          {/* Selector: Fecha */}
          <StyledSelect
            label="Fecha de creación"
            options={FECHAS}
            value={fechaFiltro}
            onChange={setFechaFiltro}
          />

          {/* Contador de resultados */}
          {!isLoading && (
            <span className="ml-auto text-[10px] font-bold text-slate-400 whitespace-nowrap">
              {docsFiltrados.length}{" "}
              {docsFiltrados.length === 1 ? "resultado" : "resultados"}
            </span>
          )}
        </div>

        {/* ── 2. TABLA DE DOCUMENTOS ── */}
        <div className="bg-white rounded-3xl border border-[#E8EDF3] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">

          {/* Cabecera de tabla — solo md+ */}
          <div className="hidden md:grid grid-cols-[1fr_220px_160px_auto] items-center gap-4 px-6 py-3 bg-slate-50/40 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Título
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Herramienta
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Fecha
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
              Acciones
            </span>
          </div>

          {/* ── Estado: Cargando ── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-7 h-7 text-[#7C6CF2] animate-spin" />
              <span className="text-xs font-semibold text-slate-500">
                Cargando historial...
              </span>
            </div>
          )}

          {/* ── Estado: Error ── */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">{error}</p>
              <button
                onClick={fetchDocumentos}
                className="text-xs font-bold text-[#7C6CF2] hover:underline cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* ── Estado: Sin resultados ── */}
          {!isLoading && !error && docsFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <FileSearch className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <p className="font-headings font-bold text-sm text-slate-700">
                  No se encontraron documentos
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xs">
                  Aún no has generado documentos o los filtros aplicados no arrojan resultados.
                  Usa el{" "}
                  <a href="/dashboard/chat" className="text-[#7C6CF2] font-semibold hover:underline">
                    EduPrompt Engine
                  </a>{" "}
                  para crear tu primer documento.
                </p>
              </div>
            </div>
          )}

          {/* ── Filas de datos ── */}
          {!isLoading && !error && docsFiltrados.length > 0 && (
            <div>
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
