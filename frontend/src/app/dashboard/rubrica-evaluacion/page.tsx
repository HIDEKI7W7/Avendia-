"use client";

import React, { useState } from "react";
import { BACKEND_URL } from "@/config/api";

const DIMENSIONES_SUGERIDAS = [
  "Comprensión conceptual",
  "Resolución de problemas",
  "Comunicación matemática",
  "Argumentación y justificación",
  "Participación y actitud",
  "Presentación y orden",
  "Trabajo colaborativo",
  "Autonomía y autorregulación",
];

const ESCALAS = [
  { value: "numerica_20", label: "Numérica (0-20)" },
  { value: "numerica_100", label: "Porcentual (0-100%)" },
  { value: "letras", label: "Literal (AD, A, B, C)" },
  { value: "descriptiva", label: "Descriptiva (Logro/Proceso/Inicio)" },
];

interface FormData {
  area_curricular: string;
  grado: string;
  competencia: string;
  titulo: string;
  desempeno_evaluado: string;
  escala: string;
  num_criterios: number;
  num_niveles: number;
  dimensiones: string[];
  contexto: string;
}

const initialForm: FormData = {
  area_curricular: "Matemática",
  grado: "3er Grado",
  competencia: "",
  titulo: "",
  desempeno_evaluado: "",
  escala: "letras",
  num_criterios: 4,
  num_niveles: 4,
  dimensiones: ["Comprensión conceptual", "Resolución de problemas"],
  contexto: "",
};

export default function RubricaEvaluacionPage() {
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

  const toggleDimension = (dim: string) => {
    setForm((prev) => {
      const active = prev.dimensiones.includes(dim);
      return {
        ...prev,
        dimensiones: active
          ? prev.dimensiones.filter((d) => d !== dim)
          : [...prev.dimensiones, dim],
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

      const title = form.titulo || `Rúbrica — ${form.competencia || form.area_curricular} — ${form.grado}`;

      const res = await fetch(`${BACKEND_URL}/api/v1/documents/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_type: "Rúbrica de Evaluación",
          title: title,
          form_data: { ...form },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Error al generar la rúbrica.");
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
          🎯 Rúbrica de Evaluación
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">
          Genera rúbricas analíticas y holísticas alineadas al CNEB con descriptores detallados por nivel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        <div className="p-7 flex flex-col gap-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Área Curricular", name: "area_curricular", placeholder: "Ej: Matemática" },
              { label: "Grado / Ciclo", name: "grado", placeholder: "Ej: 3er Grado Primaria" },
              { label: "Competencia a Evaluar", name: "competencia", placeholder: "Ej: Resuelve problemas de cantidad" },
              { label: "Título de la Rúbrica (opcional)", name: "titulo", placeholder: "Se genera automáticamente" },
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desempeño Específico a Evaluar</label>
            <textarea name="desempeno_evaluado" value={form.desempeno_evaluado} onChange={handleChange} rows={3}
              placeholder="Describe con precisión qué desempeño del CNEB se evaluará con esta rúbrica..."
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
            />
          </div>

          {/* Escala de Calificación */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escala de Calificación</label>
            <div className="grid grid-cols-2 gap-2">
              {ESCALAS.map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, escala: value }))}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.escala === value ? "bg-morado-ia text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">N° Criterios</label>
              <select name="num_criterios" value={form.num_criterios} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              >
                {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} criterios</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">N° Niveles de Logro</label>
              <select name="num_niveles" value={form.num_niveles} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              >
                {[3, 4].map((n) => <option key={n} value={n}>{n} niveles</option>)}
              </select>
            </div>
          </div>

          {/* Dimensiones */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dimensiones / Criterios Sugeridos</label>
            <div className="flex flex-wrap gap-2">
              {DIMENSIONES_SUGERIDAS.map((dim) => {
                const active = form.dimensiones.includes(dim);
                return (
                  <button key={dim} type="button" onClick={() => toggleDimension(dim)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      active ? "bg-azul-educativo text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {active ? "✓ " : ""}{dim}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contexto Pedagógico Adicional</label>
            <textarea name="contexto" value={form.contexto} onChange={handleChange} rows={2}
              placeholder="Ej: Evaluación de exposición oral grupal, proyecto interdisciplinar..."
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">⚠️ {error}</div>}
          {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">✅ ¡Rúbrica generada y descargada exitosamente!</div>}
        </div>

        <div className="px-7 py-5 border-t border-border-custom bg-slate-50/60 flex justify-end">
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-azul-educativo to-morado-ia text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generando...</> : "✨ Generar Rúbrica (.docx)"}
          </button>
        </div>
      </form>
    </div>
  );
}
