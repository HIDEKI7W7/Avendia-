"use client";

import React, { useState } from "react";
import { BACKEND_URL } from "@/config/api";

const TIPOS_FICHA = [
  "Ficha de Comprensión Lectora",
  "Ficha de Aplicación Matemática",
  "Ficha de Laboratorio / Ciencias",
  "Ficha de Arte y Cultura",
  "Ficha de Educación Física",
  "Ficha de Repaso y Refuerzo",
  "Ficha de Evaluación Formativa",
];

const NIVELES_COGNITIVOS = [
  "Recordar / Identificar",
  "Comprender / Explicar",
  "Aplicar / Resolver",
  "Analizar / Comparar",
  "Evaluar / Argumentar",
  "Crear / Diseñar",
];

interface FormData {
  tipo_ficha: string;
  tema: string;
  area_curricular: string;
  grado: string;
  titulo: string;
  proposito: string;
  num_preguntas: number;
  niveles_cognitivos: string[];
  incluir_solucionario: boolean;
  instrucciones_especiales: string;
  contexto_adicional: string;
}

const initialForm: FormData = {
  tipo_ficha: "Ficha de Aplicación Matemática",
  tema: "",
  area_curricular: "Matemática",
  grado: "3er Grado",
  titulo: "",
  proposito: "",
  num_preguntas: 5,
  niveles_cognitivos: ["Aplicar / Resolver"],
  incluir_solucionario: true,
  instrucciones_especiales: "",
  contexto_adicional: "",
};

export default function FichasAprendizajePage() {
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

  const toggleNivel = (nivel: string) => {
    setForm((prev) => {
      const active = prev.niveles_cognitivos.includes(nivel);
      return {
        ...prev,
        niveles_cognitivos: active
          ? prev.niveles_cognitivos.filter((n) => n !== nivel)
          : [...prev.niveles_cognitivos, nivel],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) { window.location.href = "/login"; return; }

      const title = form.titulo || `${form.tipo_ficha} — ${form.tema}`;

      const res = await fetch(`${BACKEND_URL}/api/v1/documents/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_type: form.tipo_ficha,
          title: title,
          form_data: {
            tema: form.tema,
            area_curricular: form.area_curricular,
            grado: form.grado,
            proposito: form.proposito,
            num_preguntas: form.num_preguntas,
            niveles_cognitivos: form.niveles_cognitivos,
            incluir_solucionario: form.incluir_solucionario,
            instrucciones_especiales: form.instrucciones_especiales,
            contexto_adicional: form.contexto_adicional,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Error al generar la ficha.");
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
          📙 Ficha de Aprendizaje
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">
          Crea fichas de trabajo, evaluación formativa y actividades prácticas con IA
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        <div className="p-7 flex flex-col gap-5">

          {/* Tipo de Ficha */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Ficha</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TIPOS_FICHA.map((tipo) => (
                <button key={tipo} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, tipo_ficha: tipo }))}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer leading-tight ${
                    form.tipo_ficha === tipo
                      ? "bg-morado-ia text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Datos del Tema */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Tema Específico", name: "tema", placeholder: "Ej: Fracciones equivalentes y sus representaciones" },
              { label: "Área Curricular", name: "area_curricular", placeholder: "Ej: Matemática, Comunicación..." },
              { label: "Grado", name: "grado", placeholder: "Ej: 3er Grado Primaria" },
              { label: "Título de la Ficha (opcional)", name: "titulo", placeholder: "Se genera automáticamente si está vacío" },
            ].map(({ label, name, placeholder }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                <input type="text" name={name} value={(form as any)[name]} onChange={handleChange}
                  placeholder={placeholder}
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Propósito de la Ficha</label>
            <textarea name="proposito" value={form.proposito} onChange={handleChange} rows={2}
              placeholder="¿Qué habilidad o competencia específica practicará el estudiante?"
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
            />
          </div>

          {/* Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">N° de Preguntas / Actividades</label>
              <select name="num_preguntas" value={form.num_preguntas} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              >
                {[3, 4, 5, 6, 8, 10, 12, 15].map((n) => <option key={n} value={n}>{n} ítems</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <input type="checkbox" id="solucionario_ficha" checked={form.incluir_solucionario}
                onChange={(e) => setForm((prev) => ({ ...prev, incluir_solucionario: e.target.checked }))}
                className="w-4 h-4 accent-morado-ia cursor-pointer"
              />
              <label htmlFor="solucionario_ficha" className="text-xs font-bold text-slate-600 cursor-pointer">
                Incluir Solucionario al final del documento
              </label>
            </div>
          </div>

          {/* Niveles Cognitivos */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Niveles Cognitivos (Taxonomía de Bloom)
            </label>
            <div className="flex flex-wrap gap-2">
              {NIVELES_COGNITIVOS.map((nivel) => {
                const active = form.niveles_cognitivos.includes(nivel);
                return (
                  <button key={nivel} type="button" onClick={() => toggleNivel(nivel)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      active ? "bg-azul-educativo text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {active ? "✓ " : ""}{nivel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instrucciones especiales */}
          {[
            { label: "Instrucciones Especiales para la IA", name: "instrucciones_especiales", placeholder: "Ej: Incluir imágenes descriptivas en texto, usar lenguaje sencillo para NEE..." },
            { label: "Contexto Adicional", name: "contexto_adicional", placeholder: "Ej: Actividad para feria científica, repasar para examen bimestral..." },
          ].map(({ label, name, placeholder }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
              <textarea name={name} value={(form as any)[name]} onChange={handleChange} rows={2}
                placeholder={placeholder}
                className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
              />
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">⚠️ {error}</div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
              ✅ ¡Ficha de Aprendizaje generada y descargada exitosamente!
            </div>
          )}
        </div>

        <div className="px-7 py-5 border-t border-border-custom bg-slate-50/60 flex justify-end">
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-azul-educativo to-morado-ia text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generando...</>
            ) : ("✨ Generar Ficha (.docx)")}
          </button>
        </div>
      </form>
    </div>
  );
}
