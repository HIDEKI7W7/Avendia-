"use client";

import React, { useState } from "react";
import { BACKEND_URL } from "@/config/api";

const INDICADORES_SUGERIDOS = [
  "Participa activamente en clase",
  "Demuestra comprensión del tema",
  "Trabaja de forma autónoma",
  "Colabora con sus compañeros",
  "Cumple con las tareas asignadas",
  "Respeta las normas de convivencia",
  "Argumenta y justifica sus respuestas",
  "Usa materiales y recursos correctamente",
  "Presenta orden y limpieza en su trabajo",
  "Muestra creatividad en sus producciones",
];

interface FormData {
  area_curricular: string;
  grado: string;
  actividad: string;
  titulo: string;
  indicadores: string[];
  indicadores_libres: string;
  incluir_autoevaluacion: boolean;
  incluir_coevaluacion: boolean;
  lista_alumnos: string;
  periodo: string;
}

const initialForm: FormData = {
  area_curricular: "Matemática",
  grado: "3er Grado",
  actividad: "",
  titulo: "",
  indicadores: ["Participa activamente en clase", "Demuestra comprensión del tema"],
  indicadores_libres: "",
  incluir_autoevaluacion: false,
  incluir_coevaluacion: false,
  lista_alumnos: "",
  periodo: "I Bimestre",
};

export default function ListaCotejoPage() {
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

  const toggleIndicador = (ind: string) => {
    setForm((prev) => {
      const active = prev.indicadores.includes(ind);
      return {
        ...prev,
        indicadores: active
          ? prev.indicadores.filter((i) => i !== ind)
          : [...prev.indicadores, ind],
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

      const title = form.titulo || `Lista de Cotejo — ${form.actividad || form.area_curricular} — ${form.grado}`;

      const res = await fetch(`${BACKEND_URL}/api/v1/documents/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_type: "Lista de Cotejo",
          title: title,
          form_data: {
            ...form,
            all_indicadores: [
              ...form.indicadores,
              ...form.indicadores_libres.split("\n").filter((i) => i.trim()),
            ],
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Error al generar la lista de cotejo.");
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
          📋 Lista de Cotejo
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">
          Genera listas de verificación con indicadores observables y espacio para todos tus estudiantes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        <div className="p-7 flex flex-col gap-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Área Curricular", name: "area_curricular", placeholder: "Ej: Comunicación" },
              { label: "Grado", name: "grado", placeholder: "Ej: 5to Primaria" },
              { label: "Actividad a Evaluar", name: "actividad", placeholder: "Ej: Exposición oral, trabajo grupal..." },
              { label: "Título de la Lista (opcional)", name: "titulo", placeholder: "Se genera automáticamente" },
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

          {/* Indicadores predefinidos */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Indicadores de Logro (Selecciona los que aplican)
            </label>
            <div className="flex flex-wrap gap-2">
              {INDICADORES_SUGERIDOS.map((ind) => {
                const active = form.indicadores.includes(ind);
                return (
                  <button key={ind} type="button" onClick={() => toggleIndicador(ind)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      active ? "bg-morado-ia text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {active ? "✓ " : ""}{ind}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">
              {form.indicadores.length} indicador(es) seleccionado(s)
            </p>
          </div>

          {/* Indicadores libres */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Indicadores Adicionales Personalizados (uno por línea)
            </label>
            <textarea name="indicadores_libres" value={form.indicadores_libres} onChange={handleChange} rows={4}
              placeholder={"Redacta el indicador exactamente como quieres que aparezca:\nEj: Identifica la idea principal del texto\nEj: Emplea el vocabulario técnico correctamente"}
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
            />
          </div>

          {/* Lista de Alumnos */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lista de Estudiantes (uno por línea)
            </label>
            <textarea name="lista_alumnos" value={form.lista_alumnos} onChange={handleChange} rows={5}
              placeholder={"1. Ana Torres García\n2. Luis Mamani Ríos\n3. María Pinedo Castro\n..."}
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none font-mono text-xs"
            />
          </div>

          {/* Autoevaluación y Coevaluación */}
          <div className="flex gap-6">
            {[
              { id: "auto", name: "incluir_autoevaluacion", label: "Incluir sección de Autoevaluación", value: form.incluir_autoevaluacion },
              { id: "co", name: "incluir_coevaluacion", label: "Incluir sección de Coevaluación", value: form.incluir_coevaluacion },
            ].map(({ id, name, label, value }) => (
              <div key={id} className="flex items-center gap-2">
                <input type="checkbox" id={id} checked={value}
                  onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.checked }))}
                  className="w-4 h-4 accent-morado-ia cursor-pointer"
                />
                <label htmlFor={id} className="text-xs font-bold text-slate-600 cursor-pointer">{label}</label>
              </div>
            ))}
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">⚠️ {error}</div>}
          {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">✅ ¡Lista de Cotejo generada y descargada exitosamente!</div>}
        </div>

        <div className="px-7 py-5 border-t border-border-custom bg-slate-50/60 flex justify-end">
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-azul-educativo to-morado-ia text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generando...</> : "✨ Generar Lista de Cotejo (.docx)"}
          </button>
        </div>
      </form>
    </div>
  );
}
