"use client";

import React, { useState } from "react";
import { GraduationCap, Plus, Users, School, Sparkles, X } from "lucide-react";

interface Aula {
  id: string;
  nombre: string;
  descripcion: string;
  estudiantesCount: number;
}

export default function AulasPage() {
  const [aulas, setAulas] = useState<Aula[]>([
    {
      id: "1",
      nombre: "sfvs",
      descripcion: "Tengo 25 estudiantes en total. Entre ellos, 3 estudiantes con diagnóstico de TDAH y 1 con dislexia leve. Requieren reforzamiento constante en comprensión lectora.",
      estudiantesCount: 0,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const planLimit = 2; // Plan gratuito · Límite de 2 aulas
  const currentCount = aulas.length;

  const handleCreateAula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const newAula: Aula = {
      id: Date.now().toString(),
      nombre,
      descripcion: descripcion || "Sin descripción adicional.",
      estudiantesCount: 0,
    };

    setAulas([...aulas, newAula]);
    setNombre("");
    setDescripcion("");
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 font-body text-slate-800">
      
      {/* Encabezado Principal */}
      <div className="flex items-center gap-2">
        <GraduationCap className="w-6.5 h-6.5 text-[#7C6CF2]" />
        <h1 className="text-2xl font-headings font-black text-slate-900 tracking-tight">
          Mis aulas
        </h1>
      </div>

      {/* 1. Indicador de Consumo o Límite de Plan */}
      <div className="self-start">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold shadow-sm">
          <span>👑</span>
          <span>Plan gratuito · {currentCount} de {planLimit} aulas</span>
        </span>
      </div>

      {/* 2. Rejilla de Tarjetas (Grid Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Mapeo de aulas creadas */}
        {aulas.map((aula) => (
          <div
            key={aula.id}
            className="bg-white border border-slate-100 hover:border-[#7C6CF2]/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[200px] group"
          >
            <div className="flex flex-col gap-4">
              {/* Encabezado: Icono de colegio y Nombre del Aula */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF7657]/10 text-[#FF7657] flex items-center justify-center shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <h3 className="font-headings font-bold text-sm text-slate-900 truncate flex-1">
                  {aula.nombre}
                </h3>
              </div>

              {/* Descripción con line-clamp para evitar romper la simetría */}
              <p className="text-slate-500 text-xs leading-relaxed font-semibold line-clamp-3">
                {aula.descripcion}
              </p>
            </div>

            {/* Pie de Tarjeta: Contador de estudiantes */}
            <div className="flex items-center gap-1.5 border-t border-slate-50 pt-4 mt-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <Users className="w-4 h-4 text-slate-400" />
              <span>👥 {aula.estudiantesCount} estudiantes</span>
            </div>
          </div>
        ))}

        {/* 4. Tarjeta Interactiva de Creación (Dashed Card) */}
        {currentCount < planLimit ? (
          <button
            onClick={() => setShowModal(true)}
            className="bg-white border-2 border-dashed border-slate-200 hover:border-[#7C6CF2]/60 hover:bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 min-h-[200px] text-slate-400 hover:text-[#7C6CF2] transition-all duration-200 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full border border-slate-200 group-hover:border-[#7C6CF2]/40 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold font-headings">
              Crear nueva aula
            </span>
          </button>
        ) : (
          <div
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[200px] bg-slate-50/30 opacity-70"
          >
            <span className="text-lg">🔒</span>
            <span className="text-xs font-bold text-slate-400 leading-tight">
              Límite de aulas alcanzado
            </span>
            <p className="text-[10px] text-slate-400 max-w-xs font-semibold">
              Pásate a Premium para crear aulas ilimitadas y desbloquear estudiantes ilimitados.
            </p>
          </div>
        )}
      </div>

      {/* MODAL DE CREACIÓN DE AULA */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C6CF2]" />
                <h3 className="font-headings font-bold text-base text-slate-900">
                  Crear Nueva Aula
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAula} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-headings">
                  Nombre del Aula / Grado y Sección
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. 1ro de Secundaria - Sección B"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#FAFBFC] focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-800 font-body transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-headings">
                  Descripción Pedagógica / Necesidades Especiales
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Aula con 30 alumnos, incluyendo 2 estudiantes con necesidades asociadas al espectro autista y 1 con discalculia..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#FAFBFC] focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-800 font-body transition-colors resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-xl bg-[#7C6CF2] hover:bg-[#5B4DC4] text-white font-headings font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Crear Aula
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
