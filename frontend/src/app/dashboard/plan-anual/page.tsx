"use client";

import React, { useState } from "react";
import { BACKEND_URL } from "@/config/api";

type Step = 1 | 2 | 3;

const ENFOQUES = [
  "Enfoque de Derechos",
  "Enfoque Inclusivo o de Atención a la Diversidad",
  "Enfoque Intercultural",
  "Enfoque Igualdad de Género",
  "Enfoque Ambiental",
  "Enfoque Orientación al Bien Común",
  "Enfoque Búsqueda de la Excelencia",
];

const AREAS_CURRICULARES = [
  "Matemática",
  "Comunicación",
  "Arte y Cultura",
  "Personal Social",
  "Ciencia y Tecnología",
  "Educación Física",
  "Inglés",
  "Educación Religiosa",
  "Educación para el Trabajo",
];

const GRADOS = [
  "1er Grado", "2do Grado", "3er Grado", "4to Grado", "5to Grado",
  "6to Grado", "1° Secundaria", "2° Secundaria", "3° Secundaria",
  "4° Secundaria", "5° Secundaria",
];

interface FormData {
  dre: string;
  ugel: string;
  ie: string;
  mse: string;
  modalidad: string;
  nivel: string;
  area_curricular: string;
  grado: string;
  seccion: string;
  ano_lectivo: number;
  tiempo: string;
  docente_responsable: string;
  director: string;
  subdirector: string;
  contexto_local: string;
  justificacion: string;
  perfil_egreso: string;
  caracteristicas_estudiantes: string;
  caracteristicas_contexto: string;
  enfoques_transversales: string[];
  competencias_anuales: Record<string, string[]>;
}

const initialForm: FormData = {
  dre: "",
  ugel: "",
  ie: "",
  mse: "JER",
  modalidad: "EBR",
  nivel: "Secundaria",
  area_curricular: "Matemática",
  grado: "3er Grado",
  seccion: "A",
  ano_lectivo: 2026,
  tiempo: "Del 16 de marzo al 18 de diciembre del 2026",
  docente_responsable: "",
  director: "",
  subdirector: "",
  contexto_local: "",
  justificacion: "",
  perfil_egreso: "",
  caracteristicas_estudiantes: "",
  caracteristicas_contexto: "",
  enfoques_transversales: [],
  competencias_anuales: {},
};

export default function PlanAnualPage() {
  const [step, setStep] = useState<Step>(1);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) { window.location.href = "/login"; return; }

      const res = await fetch(`${BACKEND_URL}/api/v1/documents/plan-anual`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          ano_lectivo: Number(form.ano_lectivo),
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Error al generar el Plan Anual.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename=(.+)/);
      a.download = match ? match[1] : "Plan_Anual.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess(true);
      setStep(1);
      setForm(initialForm);
    } catch (e: any) {
      setError(e.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Datos Institucionales", "Contexto y Enfoques", "Competencias y Generar"];

  return (
    <div className="max-w-4xl">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
          📅 Plan Curricular Anual
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">
          Genera tu plan anual personalizado con IA basado en el Currículo Nacional (MINEDU)
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {stepLabels.map((label, i) => {
          const num = (i + 1) as Step;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "bg-morado-ia text-white shadow-md shadow-morado-ia/30"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isDone ? "✓" : num}
                </div>
                <span className={`text-xs font-bold ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${step > num ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Formulario Multi-paso */}
      <div className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        {/* Step 1: Datos Institucionales */}
        {step === 1 && (
          <div className="p-7 flex flex-col gap-5">
            <h2 className="font-headings font-bold text-slate-900 text-base border-b border-border-custom pb-3">
              🏫 Datos Institucionales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "DRE", name: "dre", placeholder: "Ej: SAN MARTÍN" },
                { label: "UGEL", name: "ugel", placeholder: "Ej: LAMAS" },
                { label: "I.E. (Institución Educativa)", name: "ie", placeholder: "Ej: N° 00536 – Mi Colegio" },
                { label: "Docente Responsable", name: "docente_responsable", placeholder: "Nombres completos" },
                { label: "Director(a)", name: "director", placeholder: "Nombre del director(a)" },
                { label: "Subdirector(a)", name: "subdirector", placeholder: "Nombre del subdirector(a) (opcional)" },
              ].map(({ label, name, placeholder }) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia focus:ring-1 focus:ring-morado-ia text-sm text-slate-900 transition-all font-body"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Área Curricular</label>
                <select
                  name="area_curricular"
                  value={form.area_curricular}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                >
                  {AREAS_CURRICULARES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grado</label>
                <select
                  name="grado"
                  value={form.grado}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                >
                  {GRADOS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sección</label>
                <input
                  type="text"
                  name="seccion"
                  value={form.seccion}
                  onChange={handleChange}
                  placeholder="A, B, C..."
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modalidad</label>
                <select
                  name="modalidad"
                  value={form.modalidad}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                >
                  {["EBR", "EBA", "EBE"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nivel</label>
                <select
                  name="nivel"
                  value={form.nivel}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                >
                  {["Inicial", "Primaria", "Secundaria"].map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Periodo del Año Lectivo</label>
              <input
                type="text"
                name="tiempo"
                value={form.tiempo}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 2: Contexto y Enfoques */}
        {step === 2 && (
          <div className="p-7 flex flex-col gap-5">
            <h2 className="font-headings font-bold text-slate-900 text-base border-b border-border-custom pb-3">
              🌍 Contexto Pedagógico y Enfoques Transversales
            </h2>

            {[
              { label: "Contexto Local / Realidad del Centro", name: "contexto_local", placeholder: "Describe la realidad geográfica, socioeconómica y cultural del entorno escolar..." },
              { label: "Justificación / Necesidades de Aprendizaje", name: "justificacion", placeholder: "¿Por qué este plan responde a las necesidades de tus estudiantes?" },
              { label: "Perfil de Egreso Esperado", name: "perfil_egreso", placeholder: "Describe las competencias y habilidades que los estudiantes habrán desarrollado al finalizar el año..." },
              { label: "Características de los Estudiantes", name: "caracteristicas_estudiantes", placeholder: "Edades, intereses, estilos de aprendizaje, diversidad en el aula..." },
              { label: "Características del Contexto", name: "caracteristicas_contexto", placeholder: "Recursos disponibles, infraestructura, acceso a tecnología..." },
            ].map(({ label, name, placeholder }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                <textarea
                  name={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  rows={3}
                  placeholder={placeholder}
                  className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia focus:ring-1 focus:ring-morado-ia text-sm text-slate-900 transition-all resize-none font-body"
                />
              </div>
            ))}

            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Enfoques Transversales (Selecciona los que aplican)
              </label>
              <div className="flex flex-wrap gap-2">
                {ENFOQUES.map((e) => {
                  const active = form.enfoques_transversales.includes(e);
                  return (
                    <button
                      key={e}
                      type="button"
                      onClick={() => handleEnfoque(e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? "bg-morado-ia text-white shadow-md shadow-morado-ia/20"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {active ? "✓ " : ""}{e}
                    </button>
                  );
                })}
              </div>
              {form.enfoques_transversales.length > 0 && (
                <p className="text-xs text-slate-400 font-semibold">
                  {form.enfoques_transversales.length} enfoque(s) seleccionado(s)
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Competencias + Generar */}
        {step === 3 && (
          <div className="p-7 flex flex-col gap-5">
            <h2 className="font-headings font-bold text-slate-900 text-base border-b border-border-custom pb-3">
              🎯 Resumen y Generar Documento
            </h2>

            {/* Resumen de Datos */}
            <div className="bg-slate-50 border border-border-custom rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider">DRE:</span>
                <span className="ml-2 font-semibold text-slate-700">{form.dre || "—"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider">UGEL:</span>
                <span className="ml-2 font-semibold text-slate-700">{form.ugel || "—"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider">I.E.:</span>
                <span className="ml-2 font-semibold text-slate-700">{form.ie || "—"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider">Área:</span>
                <span className="ml-2 font-semibold text-slate-700">{form.area_curricular}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider">Grado:</span>
                <span className="ml-2 font-semibold text-slate-700">{form.grado} — Sección {form.seccion}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider">Nivel:</span>
                <span className="ml-2 font-semibold text-slate-700">{form.nivel} ({form.modalidad})</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Enfoques:</span>
                <span className="ml-2 font-semibold text-slate-700">
                  {form.enfoques_transversales.length > 0
                    ? form.enfoques_transversales.join(", ")
                    : "Ninguno seleccionado"}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-xs">
              <span className="text-blue-500 text-base mt-0.5">🤖</span>
              <div>
                <p className="font-bold text-blue-700">La IA generará automáticamente:</p>
                <ul className="mt-1 text-blue-600 font-semibold list-disc pl-4 space-y-0.5">
                  <li>Propósito y metas de aprendizaje por bimestre</li>
                  <li>Competencias y capacidades alineadas al CNEB</li>
                  <li>Enfoques transversales integrados por área</li>
                  <li>Situación significativa anual</li>
                  <li>Secuencia de unidades sugeridas</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
                ✅ ¡Plan Anual generado y descargado como .docx exitosamente!
              </div>
            )}
          </div>
        )}

        {/* Navegación entre pasos */}
        <div className="px-7 py-5 border-t border-border-custom bg-slate-50/60 flex justify-between">
          <button
            type="button"
            onClick={() => step > 1 && setStep((s) => (s - 1) as Step)}
            disabled={step === 1}
            className="px-5 py-2 rounded-xl border border-border-custom text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
          >
            ← Anterior
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-azul-educativo to-morado-ia text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando con IA...
                </>
              ) : (
                "✨ Generar Plan Anual (.docx)"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
