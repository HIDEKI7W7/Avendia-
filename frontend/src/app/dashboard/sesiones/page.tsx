"use client";

import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "@/config/api";

interface Unidad {
  id: string;
  titulo: string;
  numero_unidad: number;
}

interface FormData {
  unidad_id: string;
  numero_sesion: number;
  tema: string;
  titulo_sesion: string;
  docente: string;
  colegio: string;
  director: string;
  nivel: string;
  grado: string;
  area_curricular: string;
  contexto_estudiantes: string;
  titulo_unidad: string;
  proposito_unidad: string;
  competencia_transversal: string;
  referencias: string;
  recursos: string;
  materiales: string;
  duracion_minutos: number;
  instrumento_evaluacion: string;
  lista_alumnos: string;
  incluir_habilidades_especiales: boolean;
  generar_ficha: boolean;
  num_preguntas_ficha: number;
  incluir_solucionario: boolean;
  enfoques_transversales: string[];
}

const INSTRUMENTOS = [
  { value: "lista_cotejo", label: "Lista de Cotejo" },
  { value: "rubrica", label: "Rúbrica de Evaluación" },
  { value: "guia_observacion", label: "Guía de Observación" },
];

const DURACIONES = [45, 90, 135, 180];

const initialForm: FormData = {
  unidad_id: "",
  numero_sesion: 1,
  tema: "",
  titulo_sesion: "",
  docente: "",
  colegio: "",
  director: "",
  nivel: "Secundaria",
  grado: "",
  area_curricular: "",
  contexto_estudiantes: "",
  titulo_unidad: "",
  proposito_unidad: "",
  competencia_transversal: "",
  referencias: "",
  recursos: "",
  materiales: "",
  duracion_minutos: 90,
  instrumento_evaluacion: "lista_cotejo",
  lista_alumnos: "",
  incluir_habilidades_especiales: false,
  generar_ficha: true,
  num_preguntas_ficha: 5,
  incluir_solucionario: true,
  enfoques_transversales: [],
};

export default function SesionesPage() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchUnidades = async () => {
      setLoadingUnidades(true);
      try {
        const token = getToken();
        if (!token) { window.location.href = "/login"; return; }
        const res = await fetch(`${BACKEND_URL}/api/v1/documents/unidades`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUnidades(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingUnidades(false);
      }
    };
    fetchUnidades();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "unidad_id") {
      const unidad = unidades.find((u) => u.id === value);
      setForm((prev) => ({
        ...prev,
        unidad_id: value,
        titulo_unidad: unidad?.titulo || prev.titulo_unidad,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const token = getToken();
      if (!token) { window.location.href = "/login"; return; }

      const res = await fetch(`${BACKEND_URL}/api/v1/documents/sesion`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          numero_sesion: Number(form.numero_sesion),
          duracion_minutos: Number(form.duracion_minutos),
          num_preguntas_ficha: Number(form.num_preguntas_ficha),
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Error al generar la Sesión.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename=(.+)/);
      a.download = match ? match[1] : "Sesion.docx";
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
      <div className="mb-8">
        <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
          📝 Sesión de Aprendizaje
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">
          Genera sesiones completas con inicio, desarrollo, cierre y ficha de aplicación opcionales
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        <div className="p-7 flex flex-col gap-5">

          {/* Selector de Unidad */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              📖 Vincular a Unidad de Aprendizaje (hereda contexto curricular)
            </label>
            {loadingUnidades ? (
              <div className="text-xs text-slate-400 font-semibold py-2">Cargando unidades...</div>
            ) : (
              <select name="unidad_id" value={form.unidad_id} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              >
                <option value="">— Sin vincular —</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unidad {u.numero_unidad}: {u.titulo}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {/* Datos de la sesión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">N° Sesión</label>
              <input type="number" name="numero_sesion" value={form.numero_sesion} onChange={handleChange} min={1}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duración (minutos)</label>
              <select name="duracion_minutos" value={form.duracion_minutos} onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
              >
                {DURACIONES.map((d) => <option key={d} value={d}>{d} min ({d / 45} hora{d / 45 !== 1 ? "s" : ""})</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tema de la Sesión</label>
            <input type="text" name="tema" value={form.tema} onChange={handleChange} required
              placeholder="Ej: Operaciones con números racionales en contextos cotidianos"
              className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título de la Sesión</label>
            <input type="text" name="titulo_sesion" value={form.titulo_sesion} onChange={handleChange} required
              placeholder="Ej: Resolvemos problemas con fracciones en el mercado local"
              className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Propósito de Aprendizaje</label>
            <textarea name="proposito_unidad" value={form.proposito_unidad} onChange={handleChange} rows={3}
              placeholder="¿Qué aprenderán los estudiantes? ¿Qué competencias desarrollarán?"
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
            />
          </div>

          {/* Instrumento de Evaluación */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instrumento de Evaluación</label>
            <div className="flex gap-2">
              {INSTRUMENTOS.map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, instrumento_evaluacion: value }))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.instrumento_evaluacion === value
                      ? "bg-morado-ia text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recursos y Materiales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Materiales de Clase</label>
              <textarea name="materiales" value={form.materiales} onChange={handleChange} rows={2}
                placeholder="Ej: Papelógrafo, plumones, fichas de trabajo..."
                className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recursos Digitales</label>
              <textarea name="recursos" value={form.recursos} onChange={handleChange} rows={2}
                placeholder="Ej: Laptop, proyector, Khan Academy, GeoGebra..."
                className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none"
              />
            </div>
          </div>

          {/* Lista de Alumnos */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lista de Alumnos (uno por línea, opcional)
            </label>
            <textarea name="lista_alumnos" value={form.lista_alumnos} onChange={handleChange} rows={4}
              placeholder={"1. Ana Torres García\n2. Luis Mamani Ríos\n3. María Pinedo Castro..."}
              className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all resize-none font-mono text-xs"
            />
          </div>

          {/* Opciones de Ficha */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-800">📙 Generar Ficha de Aplicación</p>
                <p className="text-[10px] text-blue-600 mt-0.5">La IA generará un complemento práctico de la sesión en el mismo archivo</p>
              </div>
              <button type="button"
                onClick={() => setForm((prev) => ({ ...prev, generar_ficha: !prev.generar_ficha }))}
                className={`w-11 h-6 rounded-full transition-all duration-200 cursor-pointer relative ${form.generar_ficha ? "bg-morado-ia" : "bg-slate-300"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${form.generar_ficha ? "left-6" : "left-1"}`} />
              </button>
            </div>
            {form.generar_ficha && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-blue-700 uppercase">N° Preguntas</label>
                  <select name="num_preguntas_ficha" value={form.num_preguntas_ficha} onChange={handleChange}
                    className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-xs text-slate-900"
                  >
                    {[3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n} preguntas</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="solucionario" name="incluir_solucionario" checked={form.incluir_solucionario}
                    onChange={(e) => setForm((prev) => ({ ...prev, incluir_solucionario: e.target.checked }))}
                    className="w-3.5 h-3.5 accent-morado-ia cursor-pointer"
                  />
                  <label htmlFor="solucionario" className="text-[10px] font-bold text-blue-700 cursor-pointer">
                    Incluir Solucionario
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* NEE */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="nee" name="incluir_habilidades_especiales"
              checked={form.incluir_habilidades_especiales}
              onChange={(e) => setForm((prev) => ({ ...prev, incluir_habilidades_especiales: e.target.checked }))}
              className="w-4 h-4 accent-morado-ia cursor-pointer"
            />
            <label htmlFor="nee" className="text-xs font-bold text-slate-600 cursor-pointer">
              Incluir adaptaciones para estudiantes con Necesidades Educativas Especiales (NEE/DUA)
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
              ✅ ¡Sesión de Aprendizaje generada y descargada exitosamente!
            </div>
          )}
        </div>

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
              "✨ Generar Sesión (.docx)"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
