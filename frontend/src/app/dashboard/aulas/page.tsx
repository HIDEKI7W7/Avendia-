"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Plus, 
  Users, 
  School, 
  Sparkles, 
  X, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Archive, 
  AlertTriangle 
} from "lucide-react";

interface Aula {
  id: string;
  nombre: string;
  descripcion: string;
  estudiantesCount: number;
  casosNee: number;
  tdahCount: number;
  dislexiaCount: number;
  documentosCount: number;
}

export default function AulasPage() {
  const router = useRouter();

  const [aulas, setAulas] = useState<Aula[]>([
    {
      id: "1",
      nombre: "3er Grado de Primaria - Sección A",
      descripcion: "Aula con 25 estudiantes en total. Requieren reforzamiento constante en comprensión lectora.",
      estudiantesCount: 25,
      casosNee: 4,
      tdahCount: 3,
      dislexiaCount: 1,
      documentosCount: 12,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAula, setEditingAula] = useState<Aula | null>(null);
  
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estudiantesCount, setEstudiantesCount] = useState<number>(0);
  const [tdahCount, setTdahCount] = useState<number>(0);
  const [dislexiaCount, setDislexiaCount] = useState<number>(0);
  const [documentosCount, setDocumentosCount] = useState<number>(0);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const planLimit = 2; // Plan gratuito · Límite de 2 aulas
  const currentCount = aulas.length;

  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuId(null);
    if (typeof window !== "undefined") {
      window.addEventListener("click", handleCloseMenu);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("click", handleCloseMenu);
      }
    };
  }, []);

  const handleCreateAula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingAula) {
      setAulas((prev) =>
        prev.map((a) =>
          a.id === editingAula.id
            ? {
                ...a,
                nombre,
                descripcion: descripcion || "Sin descripción adicional.",
                estudiantesCount: Number(estudiantesCount),
                casosNee: Number(tdahCount) + Number(dislexiaCount),
                tdahCount: Number(tdahCount),
                dislexiaCount: Number(dislexiaCount),
                documentosCount: Number(documentosCount),
              }
            : a
        )
      );
    } else {
      const newAula: Aula = {
        id: Date.now().toString(),
        nombre,
        descripcion: descripcion || "Sin descripción adicional.",
        estudiantesCount: Number(estudiantesCount),
        casosNee: Number(tdahCount) + Number(dislexiaCount),
        tdahCount: Number(tdahCount),
        dislexiaCount: Number(dislexiaCount),
        documentosCount: 0,
      };
      setAulas([...aulas, newAula]);
    }

    handleCloseModal();
  };

  const handleCloseModal = () => {
    setNombre("");
    setDescripcion("");
    setEstudiantesCount(0);
    setTdahCount(0);
    setDislexiaCount(0);
    setDocumentosCount(0);
    setEditingAula(null);
    setShowModal(false);
  };

  const handleDeleteAula = (id: string) => {
    setAulas((prev) => prev.filter((a) => a.id !== id));
    setActiveMenuId(null);
  };

  const handlePlanificar = (aula: Aula) => {
    const prompt = `Hola EduAsesor, quiero planificar una clase para mi grupo "${aula.nombre}". Cuenta con ${aula.estudiantesCount} estudiantes en total, incluyendo ${aula.tdahCount} estudiantes con diagnóstico de TDAH y ${aula.dislexiaCount} con dislexia leve. Además, aquí tienes una descripción pedagógica del grupo: "${aula.descripcion}". Por favor, sugiéreme una sesión didáctica de aprendizaje adaptada a estas características y necesidades.`;
    if (typeof window !== "undefined") {
      localStorage.setItem("chat_initial_prompt", prompt);
    }
    router.push("/dashboard/chat");
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Encabezado Principal */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#7C6CF2]/10 text-[#7C6CF2] flex items-center justify-center shadow-inner">
          <GraduationCap className="w-6.5 h-6.5 text-[#7C6CF2]" />
        </div>
        <h1 className="text-3xl font-montserrat font-black text-slate-900 dark:text-white tracking-tight">
          Mis aulas
        </h1>
      </div>

      {/* 1. Indicador de Consumo o Límite de Plan (Bento Badge Expandido) */}
      <div className="w-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl p-5 shadow-[0_8px_30px_rgba(74,90,226,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
        <div className="flex flex-col gap-2 flex-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-headings font-extrabold uppercase tracking-widest text-[#7C6CF2] bg-[#7C6CF2]/8 px-2.5 py-0.5 rounded-full">
              Plan Gratuito
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {currentCount} de {planLimit} aulas creadas
            </span>
          </div>
          <div className="w-full h-2 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#7C6CF2] to-[#06B6D4] rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(currentCount / planLimit) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
            Has usado {currentCount} de tus {planLimit} aulas gratuitas. Pásate a Premium para aulas ilimitadas.
          </p>
        </div>
        <button 
          onClick={() => {
            const btn = document.getElementById("chatbot-toggle-button");
            if (btn) btn.click();
          }}
          className="shrink-0 py-2.5 px-4.5 rounded-xl bg-[#7C6CF2] hover:bg-[#6858E0] text-white font-headings font-extrabold text-[11px] uppercase tracking-wider shadow-lg shadow-[#7C6CF2]/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
        >
          👑 Upgrade a Premium
        </button>
      </div>

      {/* 2. Rejilla de Tarjetas (Grid Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Mapeo de aulas creadas */}
        {aulas.map((aula) => {
          const isMenuOpen = activeMenuId === aula.id;
          return (
            <div
              key={aula.id}
              className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm hover:shadow-[0_20px_50px_rgba(124,108,242,0.1)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[340px] relative group"
            >
              <div className="flex flex-col gap-4">
                {/* Header de la tarjeta */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C6CF2]/10 to-[#06B6D4]/10 text-[#7C6CF2] flex items-center justify-center shrink-0">
                      <School className="w-5 h-5 text-[#7C6CF2]" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-montserrat font-black text-sm text-slate-900 dark:text-white truncate">
                        {aula.nombre}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                          📂 {aula.documentosCount} documentos creados
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menú de Tres Puntos */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : aula.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Options */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-20 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAula(aula);
                            setNombre(aula.nombre);
                            setDescripcion(aula.descripcion);
                            setEstudiantesCount(aula.estudiantesCount);
                            setTdahCount(aula.tdahCount);
                            setDislexiaCount(aula.dislexiaCount);
                            setDocumentosCount(aula.documentosCount);
                            setShowModal(true);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Aula "${aula.nombre}" archivada correctamente.`);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archivar</span>
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAula(aula.id);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Módulo de Métricas (Chips visuales Bento) */}
                <div className="flex gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-[11px] font-bold shadow-sm">
                    👥 {aula.estudiantesCount} Estudiantes
                  </span>
                  {aula.casosNee > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-100/50 dark:border-amber-900/10 shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                      {aula.casosNee} Casos NEE
                    </span>
                  )}
                </div>

                {/* Desglose Diagnóstico Inteligente (Bento Interno) */}
                <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2 mt-1.5">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">
                    Diagnóstico Pedagógico
                  </span>
                  <p className="text-slate-600 dark:text-slate-450 text-[11px] font-semibold leading-relaxed line-clamp-3 pl-0.5 mb-1">
                    {aula.descripcion}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {aula.tdahCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 text-[10px] font-bold border border-purple-100/30 dark:border-purple-900/10">
                        🧠 TDAH ({aula.tdahCount})
                      </span>
                    )}
                    {aula.dislexiaCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 text-[10px] font-bold border border-sky-100/30 dark:border-sky-900/10">
                        📝 Dislexia Leve ({aula.dislexiaCount})
                      </span>
                    )}
                    {aula.casosNee === 0 && (
                      <span className="text-[10px] font-bold text-slate-400 italic">
                        Sin alertas NEE reportadas
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Planificación Directa con IA */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => handlePlanificar(aula)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7C6CF2] to-[#06B6D4] text-white font-headings font-extrabold text-xs uppercase tracking-widest shadow-md hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>✨ Planificar para esta aula</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* 4. Tarjeta Interactiva de Creación (Bento Crear Nueva Aula) */}
        {currentCount < planLimit ? (
          <button
            onClick={() => {
              setEditingAula(null);
              setNombre("");
              setDescripcion("");
              setEstudiantesCount(0);
              setTdahCount(0);
              setDislexiaCount(0);
              setDocumentosCount(0);
              setShowModal(true);
            }}
            className="bg-slate-50/30 hover:bg-indigo-50/20 dark:bg-slate-900/20 dark:hover:bg-[#7C6CF2]/10 border-2 border-dashed border-[#7C6CF2]/30 hover:border-[#7C6CF2]/70 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 min-h-[340px] text-slate-400 hover:text-[#7C6CF2] transition-all duration-300 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 group-hover:border-[#7C6CF2]/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-90">
              <Plus className="w-5 h-5 text-slate-500 group-hover:text-[#7C6CF2] transition-colors" />
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-350 font-headings group-hover:text-[#7C6CF2] transition-colors">
                Crear nueva aula
              </span>
              <span className="block text-[10px] font-semibold text-slate-450 dark:text-slate-500 mt-1 max-w-[160px] mx-auto leading-normal">
                Agregar un nuevo grupo de aprendizaje
              </span>
            </div>
          </button>
        ) : (
          <div
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[340px] bg-slate-50/10 opacity-70"
          >
            <span className="text-2xl">🔒</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">
              Límite de aulas alcanzado
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs font-semibold leading-normal">
              Pásate a Premium para crear aulas ilimitadas y desbloquear estudiantes ilimitados.
            </p>
          </div>
        )}
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN DE AULA */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C6CF2]" />
                <h3 className="font-montserrat font-black text-base text-slate-900 dark:text-white">
                  {editingAula ? "Editar Aula" : "Crear Nueva Aula"}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAula} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-headings">
                  Nombre del Aula / Grado y Sección
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. 3er Grado de Primaria - Sección A"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-[#FAFBFC] dark:bg-slate-950 focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-800 dark:text-white font-body transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-headings">
                  Descripción Pedagógica / Necesidades Especiales
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Aula con estudiantes dinámicos. Requieren reforzamiento constante en comprensión lectora."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-[#FAFBFC] dark:bg-slate-950 focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-800 dark:text-white font-body transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider font-headings">
                    Estudiantes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={estudiantesCount}
                    onChange={(e) => setEstudiantesCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-[#FAFBFC] dark:bg-slate-950 focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-800 dark:text-white font-body transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider font-headings">
                    🧠 TDAH
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tdahCount}
                    onChange={(e) => setTdahCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-[#FAFBFC] dark:bg-slate-950 focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-800 dark:text-white font-body transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider font-headings">
                    📝 Dislexia
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dislexiaCount}
                    onChange={(e) => setDislexiaCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-[#FAFBFC] dark:bg-slate-950 focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-800 dark:text-white font-body transition-colors"
                  />
                </div>
              </div>

              {editingAula && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-headings">
                    Documentos Creados
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={documentosCount}
                    onChange={(e) => setDocumentosCount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-[#FAFBFC] dark:bg-slate-950 focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-800 dark:text-white font-body transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-xl bg-[#7C6CF2] hover:bg-[#5B4DC4] text-white font-headings font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                {editingAula ? "Guardar Cambios" : "Crear Aula"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
