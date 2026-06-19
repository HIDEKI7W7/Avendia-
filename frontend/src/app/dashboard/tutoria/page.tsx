"use client";

import React, { useState } from "react";
import { BACKEND_URL } from "@/config/api";

const TEMAS_TUTORIA = [
  "Proyecto de Vida",
  "Habilidades Socioemocionales",
  "Convivencia Escolar",
  "Orientación Vocacional",
  "Salud Mental y Bienestar",
  "Uso Responsable de Internet",
  "Prevención de Violencia",
  "Educación Sexual Integral",
  "Ciudadanía y Democracia",
  "Hábitos de Estudio",
];

const MODALIDADES_TUTORIA = [
  { value: "individual", label: "Individual", icon: "👤" },
  { value: "grupal", label: "Grupal / Aula", icon: "👥" },
  { value: "familiar", label: "Con Familia", icon: "👪" },
];

interface FormData {
  grado: string;
  seccion: string;
  docente_tutor: string;
  titulo: string;
  tema_principal: string;
  modalidad: string;
  duracion_minutos: number;
  objetivo: string;
  descripcion_grupo: string;
  casos_especiales: string;
  actividades_propuestas: string;
  mes: string;
  nivel: string;
}

const MESES = [
  "Marzo", "Abril", "Mayo", "Junio", "Julio",
  "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const initialForm: FormData = {
  grado: "3er Grado",
  seccion: "A",
  docente_tutor: "",
  titulo: "",
  tema_principal: "Habilidades Socioemocionales",
  modalidad: "grupal",
  duracion_minutos: 45,
  objetivo: "",
  descripcion_grupo: "",
  casos_especiales: "",
  actividades_propuestas: "",
  mes: "Abril",
  nivel: "Secundaria",
};

export default function TutoriaPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) { window.location.href = "/login"; return; }

      const title =
        form.titulo ||
        `Plan de Tutoría — ${form.tema_principal} — ${form.grado} ${form.mes}`;

      const res = await fetch(`${BACKEND_URL}/api/v1/documents/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_type: "Plan de Tutoría",
          title: title,
          form_data: { ...form },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Error al generar el Plan de Tutoría.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/ /g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess(true);
      setForm(initialForm);
    } catch (e: any) {
      setError(e.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
          👪 Plan de Tutoría
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">
          Genera planes de acción tutorial mensuales basados en el bienestar integral del estudiante
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        <div className="p-7 flex flex-col gap-5">

          {/* Tema Principal */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tema de Tutoría</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TEMAS_TUTORIA.map((tema) => (
                <button key={tema} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, tema_principal: tema }))}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer leading-tight ${
                    form.tema_principal === tema
                      ? "bg-morado-ia text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tema}
                </button>
              ))}
            </div>
          </div>

          {/* Modalidad */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modalidad de Tutoría</label>
            <div className="flex gap-2">
              {MODALIDADES_TUTORIA.map(({ value, label, icon }) => (
                <button key={value} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, modalidad: value }))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    form.modalidad === value ? "bg-morado-ia text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Datos Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Grado", name: "grado", placeholder: "Ej: 3er Grado" },
              { label: "Sección", name: "seccion", placeholder: "A, B, C..." },
              { label: "Mes", name: "mes", type: "select", options: MESES },
            ].map(({ label, name, placeholder, type, options }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                {type === "select" ? (
                  <select name={name} value={(form as any)[name]} onChange={handleChange}
                    className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                  >
                    {options!.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" name={name} value={(form as any)[name]} onChange={handleChange}
                    placeholder={placeholder}
                    className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Docente Tutor(a)</label>
              <input type="text" name="docente_tutor" value={form.docente_tutor} onChange={handleChange}
                placeholder="Nombres completos del tutor"
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duración (min)</label>
              <select name="duracion_minutos" value={form.duracion_minutos} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              >
                {[30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} minutos</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Objetivo de la Sesión de Tutoría</label>
            <textarea name="objetivo" value={form.objetivo} onChange={handleChange} rows={3}
              placeholder="¿Qué se espera que los estudiantes desarrollen o reflexionen durante esta sesión de tutoría?"
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción del Grupo / Diagnóstico</label>
            <textarea name="descripcion_grupo" value={form.descripcion_grupo} onChange={handleChange} rows={3}
              placeholder="Describe la dinámica del aula, necesidades identificadas, logros previos observados..."
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
            />
          </div>

          {[
            { label: "Casos Especiales o de Atención Prioritaria", name: "casos_especiales", placeholder: "Estudiantes en riesgo, situaciones familiares, alertas de convivencia... (confidencial)" },
            { label: "Actividades Propuestas (si tienes ideas previas)", name: "actividades_propuestas", placeholder: "Dinámicas, técnicas, materiales que deseas que la IA integre al plan..." },
          ].map(({ label, name, placeholder }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
              <textarea name={name} value={(form as any)[name]} onChange={handleChange} rows={2}
                placeholder={placeholder}
                className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
              />
            </div>
          ))}

          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 flex items-start gap-3 text-xs">
            <span className="text-amber-500 text-base mt-0.5">🤖</span>
            <div>
              <p className="font-bold text-amber-700">La IA generará automáticamente:</p>
              <ul className="mt-1 text-amber-600 font-semibold list-disc pl-4 space-y-0.5">
                <li>Actividades de inicio, desarrollo y cierre</li>
                <li>Recursos y materiales para la sesión</li>
                <li>Indicadores de logro observables</li>
                <li>Compromisos y acuerdos de seguimiento</li>
              </ul>
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">⚠️ {error}</div>}
          {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">✅ ¡Plan de Tutoría generado y descargado exitosamente!</div>}
        </div>

        <div className="px-7 py-5 border-t border-border-custom bg-slate-50/60 flex justify-end">
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-azul-educativo to-morado-ia text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generando...</> : "✨ Generar Plan de Tutoría (.docx)"}
          </button>
        </div>
      </form>
    </div>
  );
}
