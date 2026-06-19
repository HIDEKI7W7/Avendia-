"use client";

import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "@/config/api";

interface PlanAnual {
  id: string;
  area_curricular: string;
  grado: string;
  seccion: string;
}

interface FormData {
  plan_anual_id: string;
  numero_unidad: number;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_semanas: number;
  situacion_significativa: string;
  situacion_source: string;
  contexto_estudiantes: string;
  producto: string;
  campos_tematicos: string;
  docente: string;
  director: string;
  ie: string;
  nivel: string;
  grado: string;
  area_curricular: string;
  periodo: string;
  num_estudiantes: number;
  turno: string;
  enfoques_transversales: string[];
}

const ENFOQUES = [
  "Enfoque de Derechos",
  "Enfoque Inclusivo o de Atención a la Diversidad",
  "Enfoque Intercultural",
  "Enfoque Igualdad de Género",
  "Enfoque Ambiental",
];

const PERIODOS = ["I Bimestre", "II Bimestre", "III Bimestre", "IV Bimestre", "I Trimestre", "II Trimestre", "III Trimestre"];

const initialForm: FormData = {
  plan_anual_id: "",
  numero_unidad: 1,
  titulo: "",
  fecha_inicio: "",
  fecha_fin: "",
  duracion_semanas: 4,
  situacion_significativa: "",
  situacion_source: "ia",
  contexto_estudiantes: "",
  producto: "",
  campos_tematicos: "",
  docente: "",
  director: "",
  ie: "",
  nivel: "Secundaria",
  grado: "",
  area_curricular: "",
  periodo: "I Bimestre",
  num_estudiantes: 25,
  turno: "Mañana",
  enfoques_transversales: [],
};

export default function UnidadesPage() {
  const [planes, setPlanes] = useState<PlanAnual[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchPlanes = async () => {
      setLoadingPlanes(true);
      try {
        const token = getToken();
        if (!token) { window.location.href = "/login"; return; }
        const res = await fetch(`${BACKEND_URL}/api/v1/documents/plan-anual`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPlanes(data);
          if (data.length > 0) {
            setForm((prev) => ({
              ...prev,
              plan_anual_id: data[0].id,
              grado: data[0].grado,
              area_curricular: data[0].area_curricular,
            }));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPlanes(false);
      }
    };
    fetchPlanes();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "plan_anual_id") {
      const plan = planes.find((p) => p.id === value);
      if (plan) {
        setForm((prev) => ({
          ...prev,
          plan_anual_id: value,
          grado: plan.grado,
          area_curricular: plan.area_curricular,
        }));
        return;
      }
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnfoque = (enfoque: string) => {
    setForm((prev) => {
      const active = prev.enfoques_transversales.includes(enfoque);
      return {
        ...prev,
        enfoques_transversales: active
          ? prev.enfoques_transversales.filter((e) => e !== enfoque)
          : [...prev.enfoques_transversales, enfoque],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const token = getToken();
      if (!token) { window.location.href = "/login"; return; }

      const res = await fetch(`${BACKEND_URL}/api/v1/documents/unidad`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          numero_unidad: Number(form.numero_unidad),
          num_estudiantes: Number(form.num_estudiantes),
          duracion_semanas: Number(form.duracion_semanas),
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Error al generar la Unidad.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename=(.+)/);
      a.download = match ? match[1] : "Unidad.docx";
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
    <div className="max-w-4xl">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
          📖 Unidad de Aprendizaje
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">
          Genera tu unidad didáctica con situación significativa e integración curricular
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        <div className="p-7 flex flex-col gap-5">

          {/* Selector de Plan Anual */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              📅 Vincular a Plan Anual (opcional — hereda contexto automáticamente)
            </label>
            {loadingPlanes ? (
              <div className="text-xs text-slate-400 font-semibold py-2">Cargando planes anuales...</div>
            ) : (
              <select
                name="plan_anual_id"
                value={form.plan_anual_id}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              >
                <option value="">— Sin vincular (datos manuales) —</option>
                {planes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.area_curricular} — {p.grado} Sección {p.seccion}
                  </option>
                ))}
              </select>
            )}
            {form.plan_anual_id && (
              <p className="text-[10px] text-emerald-600 font-bold">
                ✓ El grado y área se heredan automáticamente del Plan Anual seleccionado.
              </p>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {/* Datos de la Unidad */}
          <h2 className="font-headings font-bold text-slate-800 text-sm uppercase tracking-wider">
            Datos de la Unidad
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">N° Unidad</label>
              <input type="number" name="numero_unidad" value={form.numero_unidad} onChange={handleChange} min={1} max={12}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duración (semanas)</label>
              <input type="number" name="duracion_semanas" value={form.duracion_semanas} onChange={handleChange} min={1} max={20}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Periodo</label>
              <select name="periodo" value={form.periodo} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              >
                {PERIODOS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título de la Unidad</label>
            <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required
              placeholder="Ej: Unidad 1 — Los números racionales en nuestra vida cotidiana"
              className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Inicio</label>
              <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Fin</label>
              <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Situación Significativa */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Situación Significativa</label>
              <div className="flex items-center gap-2">
                {["ia", "manual"].map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, situacion_source: src }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      form.situacion_source === src
                        ? "bg-morado-ia text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {src === "ia" ? "🤖 Dejar a la IA" : "✍️ Redactar yo"}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              name="situacion_significativa"
              value={form.situacion_significativa}
              onChange={handleChange}
              rows={4}
              placeholder={
                form.situacion_source === "ia"
                  ? "La IA creará una situación significativa contextualizada. Puedes añadir pistas aquí..."
                  : "Redacta la situación significativa de la unidad de forma completa..."
              }
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
            />
          </div>

          {/* Datos de Contexto */}
          {[
            { label: "Contexto de los Estudiantes (DUA 2026)", name: "contexto_estudiantes", rows: 2, placeholder: "Diversidad, NEE, características del grupo..." },
            { label: "Productos Esperados", name: "producto", rows: 2, placeholder: "Ej: Informe, presentación oral, maqueta..." },
            { label: "Campos Temáticos y Conceptos Clave", name: "campos_tematicos", rows: 2, placeholder: "Ej: Números racionales, fracciones, proporcionalidad directa..." },
          ].map(({ label, name, rows, placeholder }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
              <textarea
                name={name}
                value={(form as any)[name]}
                onChange={handleChange}
                rows={rows}
                placeholder={placeholder}
                className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
              />
            </div>
          ))}

          {/* Datos adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">N° Estudiantes</label>
              <input type="number" name="num_estudiantes" value={form.num_estudiantes} onChange={handleChange} min={1}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turno</label>
              <select name="turno" value={form.turno} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              >
                {["Mañana", "Tarde", "Noche"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Área (si no heredada)</label>
              <input type="text" name="area_curricular" value={form.area_curricular} onChange={handleChange}
                placeholder="Ej: Matemática"
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Enfoques */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enfoques Transversales</label>
            <div className="flex flex-wrap gap-2">
              {ENFOQUES.map((e) => {
                const active = form.enfoques_transversales.includes(e);
                return (
                  <button key={e} type="button" onClick={() => handleEnfoque(e)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      active ? "bg-morado-ia text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {active ? "✓ " : ""}{e}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estados */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
              ✅ ¡Unidad de Aprendizaje generada y descargada exitosamente!
            </div>
          )}
        </div>

        {/* Acción */}
        <div className="px-7 py-5 border-t border-border-custom bg-slate-50/60 flex justify-end">
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-azul-educativo to-morado-ia text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando con IA...
              </>
            ) : (
              "✨ Generar Unidad (.docx)"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
