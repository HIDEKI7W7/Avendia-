"use client";

import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "@/config/api";

type Step = 1 | 2 | 3 | 4;

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

// CNEB Catalog of Competencies & Capacities (Matemática & Comunicación)
const CNEB_CATALOG: Record<string, Array<{ id: string; nombre: string; capacidades: string[]; desempenos: string[] }>> = {
  "Matemática": [
    {
      id: "C1",
      nombre: "Resuelve problemas de cantidad",
      capacidades: [
        "Traduce cantidades a expresiones numéricas",
        "Comunica su comprensión sobre los números y las operaciones",
        "Usa estrategias y procedimientos de estimación y cálculo",
        "Argumenta afirmaciones sobre las relaciones numéricas y las operaciones"
      ],
      desempenos: [
        "Establece relaciones entre datos y acciones de comparar, igualar e incorporar cantidades, y las transforma a expresiones numéricas.",
        "Expresa con diversas representaciones y lenguaje numérico su comprensión de la fracción como parte-todo.",
        "Selecciona y emplea estrategias de cálculo y procedimientos de estimación para operar con números racionales."
      ]
    },
    {
      id: "C2",
      nombre: "Resuelve problemas de regularidad, equivalencia y cambio",
      capacidades: [
        "Traduce datos y condiciones a expresiones algebraicas y gráficas",
        "Comunica su comprensión sobre las relaciones algebraicas",
        "Usa estrategias y procedimientos para encontrar equivalencias y reglas generales",
        "Argumenta afirmaciones sobre relaciones de cambio y equivalencia"
      ],
      desempenos: [
        "Establece relaciones entre datos, valores desconocidos, regularidades y condiciones de equivalencia, y las transforma a ecuaciones lineales o inecuaciones.",
        "Expresa con diversas representaciones gráficas, tabulares y simbólicas su comprensión de la regla de formación de una progresión aritmética."
      ]
    },
    {
      id: "C3",
      nombre: "Resuelve problemas de forma, movimiento y localización",
      capacidades: [
        "Modela objetos con formas geométricas y sus transformaciones",
        "Comunica su comprensión sobre las formas y relaciones geométricas",
        "Usa estrategias y procedimientos para orientarse en el espacio",
        "Argumenta afirmaciones sobre relaciones geométricas"
      ],
      desempenos: [
        "Establece relaciones entre las características y atributos medibles de objetos reales o imaginarios, y los asocia con formas geométricas bidimensionales y tridimensionales.",
        "Expresa su comprensión de las propiedades de los prismas y cuerpos de revolución empleando dibujos y lenguaje geométrico."
      ]
    },
    {
      id: "C4",
      nombre: "Resuelve problemas de gestión de datos e incertidumbre",
      capacidades: [
        "Representa datos con gráficos y medidas estadísticas o probabilísticas",
        "Comunica su comprensión de los conceptos estadísticos y probabilísticos",
        "Usa estrategias y procedimientos para recopilar y procesar datos",
        "Argumenta afirmaciones sobre la información obtenida"
      ],
      desempenos: [
        "Representa el comportamiento de los datos de una población a través de tablas de frecuencias y gráficos de barras o circulares.",
        "Expresa su comprensión de las medidas de tendencia central y de la probabilidad de sucesos simples."
      ]
    }
  ],
  "Comunicación": [
    {
      id: "C1",
      nombre: "Se comunica oralmente en su lengua materna",
      capacidades: [
        "Obtiene información del texto oral",
        "Infiere e interpreta información del texto oral",
        "Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada",
        "Utiliza recursos no verbales y paraverbales de forma estratégica",
        "Interactúa estratégicamente con distintos interlocutores",
        "Reflexiona y evalúa la forma, el contenido y contexto del texto oral"
      ],
      desempenos: [
        "Recupera información explícita de los textos orales que escucha seleccionando datos específicos.",
        "Deduce diversas relaciones lógicas entre las ideas del texto oral (causa-efecto, semejanza-diferencia)."
      ]
    },
    {
      id: "C2",
      nombre: "Lee diversos tipos de textos escritos en su lengua materna",
      capacidades: [
        "Obtiene información del texto escrito",
        "Infiere e interpreta información del texto",
        "Reflexiona y evalúa la forma, el contenido y contexto del texto"
      ],
      desempenos: [
        "Identifica información explícita, relevante y complementaria seleccionando datos específicos en los textos que lee.",
        "Deduce relaciones lógicas y el significado de palabras en contexto a partir de información explícita e implícita."
      ]
    },
    {
      id: "C3",
      nombre: "Escribe diversos tipos de textos en su lengua materna",
      capacidades: [
        "Adecúa el texto a la situación comunicativa",
        "Organiza y desarrolla las ideas de forma coherente y cohesionada",
        "Utiliza convenciones del lenguaje escrito de forma pertinente",
        "Reflexiona y evalúa la forma, el contenido y contexto del texto escrito"
      ],
      desempenos: [
        "Adecúa el texto a la situación comunicativa considerando el propósito comunicativo, el tipo textual y las características del género discursivo.",
        "Escribe textos de forma coherente y cohesionada ordenando las ideas en torno a un tema sin contradicciones o digresiones."
      ]
    }
  ]
};

const DEFAULT_BIMESTRES = {
  "I Bimestre": { inicio: "2026-03-16", fin: "2026-05-15" },
  "II Bimestre": { inicio: "2026-05-18", fin: "2026-07-24" },
  "III Bimestre": { inicio: "2026-08-10", fin: "2026-10-09" },
  "IV Bimestre": { inicio: "2026-10-12", fin: "2026-12-18" }
};

const DEFAULT_TRIMESTRES = {
  "I Trimestre": { inicio: "2026-03-16", fin: "2026-06-12" },
  "II Trimestre": { inicio: "2026-06-15", fin: "2026-09-18" },
  "III Trimestre": { inicio: "2026-09-21", fin: "2026-12-18" }
};

interface CompetenciaSeleccionada {
  competencia_id: string;
  nombre: string;
  capacidades: string[];
  desempeños_priorizados: string[];
}

interface FormData {
  dre: string;
  ugel: string;
  institucion_educativa: string;
  grado: string;
  seccion: string;
  area_curricular: string;
  ciclo: string;
  turno: string;
  descripcion_estudiante: string;
  descripcion_contexto_local: string;
  organizacion_tiempo: Record<string, { inicio: string; fin: string }>;
  enfoques_transversales: string[];
  competencias_anuales: CompetenciaSeleccionada[];
  ano_lectivo: number;
  tiempo: string;
  docente_responsable: string;
  director: string;
  subdirector: string;
}

const initialForm: FormData = {
  dre: "",
  ugel: "",
  institucion_educativa: "",
  grado: "3° Secundaria",
  seccion: "A",
  area_curricular: "Matemática",
  ciclo: "Ciclo VII",
  turno: "Mañana",
  descripcion_estudiante: "",
  descripcion_contexto_local: "",
  organizacion_tiempo: DEFAULT_BIMESTRES,
  enfoques_transversales: [],
  competencias_anuales: [],
  ano_lectivo: 2026,
  tiempo: "Del 16 de marzo al 18 de diciembre del 2026",
  docente_responsable: "",
  director: "",
  subdirector: "",
};

export default function PlanAnualPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // States to build/edit competencies
  const [selectedCompId, setSelectedCompId] = useState("");
  const [customCompNombre, setCustomCompNombre] = useState("");
  const [customCompId, setCustomCompId] = useState("");
  const [customCapName, setCustomCapName] = useState("");
  const [customDesempeno, setCustomDesempeno] = useState("");
  const [activeTabTiempo, setActiveTabTiempo] = useState<"bimestres" | "trimestres">("bimestres");

  // Cycle auto-calculator
  useEffect(() => {
    let ciclo = "Ciclo VII";
    const g = form.grado;
    if (g.includes("1er Grado") || g.includes("2do Grado") || g.includes("1° Secundaria") || g.includes("2° Secundaria")) {
      ciclo = "Ciclo VI";
    } else if (g.includes("3er Grado") || g.includes("4to Grado") || g.includes("5to Grado") || g.includes("6to Grado")) {
      ciclo = "Ciclo V";
    }
    setForm((prev) => ({ ...prev, ciclo }));
  }, [form.grado]);

  // Handle temporal structure changes
  const handleToggleTiempo = (type: "bimestres" | "trimestres") => {
    setActiveTabTiempo(type);
    setForm((prev) => ({
      ...prev,
      organizacion_tiempo: type === "bimestres" ? DEFAULT_BIMESTRES : DEFAULT_TRIMESTRES
    }));
  };

  const handleDateChange = (period: string, field: "inicio" | "fin", val: string) => {
    setForm((prev) => ({
      ...prev,
      organizacion_tiempo: {
        ...prev.organizacion_tiempo,
        [period]: {
          ...prev.organizacion_tiempo[period],
          [field]: val
        }
      }
    }));
  };

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

  // Competency Tree Operations
  const handleAddCompetenciaCatalog = () => {
    if (!selectedCompId) return;
    const catalog = CNEB_CATALOG[form.area_curricular] || [];
    const item = catalog.find((c) => c.id === selectedCompId);
    if (!item) return;

    // Check if already added
    if (form.competencias_anuales.some((c) => c.competencia_id === item.id)) {
      alert("Esta competencia ya ha sido agregada.");
      return;
    }

    const newComp: CompetenciaSeleccionada = {
      competencia_id: item.id,
      nombre: item.nombre,
      capacidades: [...item.capacidades], // precheck all by default
      desempeños_priorizados: []
    };

    setForm((prev) => ({
      ...prev,
      competencias_anuales: [...prev.competencias_anuales, newComp]
    }));
    setSelectedCompId("");
  };

  const handleAddCompetenciaCustom = () => {
    if (!customCompNombre) return;
    const cId = customCompId.trim() || `C_custom_${Date.now()}`;

    if (form.competencias_anuales.some((c) => c.competencia_id === cId)) {
      alert("ID de competencia duplicado.");
      return;
    }

    const newComp: CompetenciaSeleccionada = {
      competencia_id: cId,
      nombre: customCompNombre,
      capacidades: [],
      desempeños_priorizados: []
    };

    setForm((prev) => ({
      ...prev,
      competencias_anuales: [...prev.competencias_anuales, newComp]
    }));

    setCustomCompNombre("");
    setCustomCompId("");
  };

  const handleRemoveCompetencia = (comp_id: string) => {
    setForm((prev) => ({
      ...prev,
      competencias_anuales: prev.competencias_anuales.filter((c) => c.competencia_id !== comp_id)
    }));
  };

  const handleToggleCapacidad = (comp_id: string, cap: string) => {
    setForm((prev) => ({
      ...prev,
      competencias_anuales: prev.competencias_anuales.map((c) => {
        if (c.competencia_id !== comp_id) return c;
        const exists = c.capacidades.includes(cap);
        return {
          ...c,
          capacidades: exists ? c.capacidades.filter((x) => x !== cap) : [...c.capacidades, cap]
        };
      })
    }));
  };

  const handleAddCustomCapacidad = (comp_id: string) => {
    if (!customCapName.trim()) return;
    setForm((prev) => ({
      ...prev,
      competencias_anuales: prev.competencias_anuales.map((c) => {
        if (c.competencia_id !== comp_id) return c;
        if (c.capacidades.includes(customCapName.trim())) return c;
        return {
          ...c,
          capacidades: [...c.capacidades, customCapName.trim()]
        };
      })
    }));
    setCustomCapName("");
  };

  const handleAddDesempeno = (comp_id: string, text_des: string) => {
    if (!text_des.trim()) return;
    setForm((prev) => ({
      ...prev,
      competencias_anuales: prev.competencias_anuales.map((c) => {
        if (c.competencia_id !== comp_id) return c;
        if (c.desempeños_priorizados.includes(text_des.trim())) return c;
        return {
          ...c,
          desempeños_priorizados: [...c.desempeños_priorizados, text_des.trim()]
        };
      })
    }));
  };

  const handleRemoveDesempeno = (comp_id: string, text_des: string) => {
    setForm((prev) => ({
      ...prev,
      competencias_anuales: prev.competencias_anuales.map((c) => {
        if (c.competencia_id !== comp_id) return c;
        return {
          ...c,
          desempeños_priorizados: c.desempeños_priorizados.filter((d) => d !== text_des)
        };
      })
    }));
  };

  const handleSubmit = async () => {
    if (form.competencias_anuales.length === 0) {
      setError("Debes priorizar al menos una competencia en el Paso 3.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

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
      setError(e.message || "Ocurrió un error inesperado al generar el plan.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    "Datos Informativos",
    "Contexto y Temporalidad",
    "Árbol Curricular",
    "Resumen y Generar"
  ];

  const currentCatalog = CNEB_CATALOG[form.area_curricular] || [];

  return (
    <div className="max-w-4xl font-body">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
          📅 Plan Curricular Anual
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">
          Genera tu plan curricular anual (CNEB) combinando rigurosidad técnica y UX de multipasos.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2 scrollbar-thin">
        {stepLabels.map((label, i) => {
          const num = (i + 1) as Step;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2 shrink-0">
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
                <div className={`flex-1 min-w-[20px] h-px mx-3 ${step > num ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Formulario Multi-paso */}
      <div className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden mb-6">
        
        {/* Paso 1: Datos Informativos */}
        {step === 1 && (
          <div className="p-7 flex flex-col gap-5">
            <h2 className="font-headings font-bold text-slate-900 text-base border-b border-border-custom pb-3 flex items-center gap-2">
              🏫 1. Datos Informativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "DRE (Dirección Regional)", name: "dre", placeholder: "Ej: DRE SAN MARTÍN" },
                { label: "UGEL (Unidad de Gestión)", name: "ugel", placeholder: "Ej: UGEL LAMAS" },
                { label: "I.E. (Institución Educativa)", name: "institucion_educativa", placeholder: "Ej: IE N° 00536 - F.I.M." },
                { label: "Docente Responsable", name: "docente_responsable", placeholder: "Nombres y apellidos completos" },
                { label: "Director(a)", name: "director", placeholder: "Director de la Institución Educativa" },
                { label: "Subdirector(a)", name: "subdirector", placeholder: "Subdirector (Opcional)" },
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
                  placeholder="Ej: A, B o Única"
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ciclo CNEB</label>
                <input
                  type="text"
                  name="ciclo"
                  value={form.ciclo}
                  onChange={handleChange}
                  placeholder="Se auto-calcula con el grado"
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-100 text-slate-500 focus:outline-none text-sm font-semibold transition-all"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turno</label>
                <select
                  name="turno"
                  value={form.turno}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                >
                  {["Mañana", "Tarde", "Completo"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Año Lectivo</label>
                <input
                  type="number"
                  name="ano_lectivo"
                  value={form.ano_lectivo}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia text-sm text-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duración Anual</label>
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

        {/* Paso 2: Contexto y Temporalidad */}
        {step === 2 && (
          <div className="p-7 flex flex-col gap-6">
            <h2 className="font-headings font-bold text-slate-900 text-base border-b border-border-custom pb-3">
              🌍 2. Contexto Pedagógico y Temporalidad
            </h2>

            {/* Contextos */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Descripción de los Estudiantes (Intereses, Ritmos, Habilidades)
                </label>
                <textarea
                  name="descripcion_estudiante"
                  value={form.descripcion_estudiante}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe cómo son tus alumnos (edades, cómo aprenden, intereses particulares, etc.)..."
                  className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia focus:ring-1 focus:ring-morado-ia text-sm text-slate-900 transition-all resize-none font-body"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Descripción del Contexto Local (Realidad Familiar, Geografía, Cultura)
                </label>
                <textarea
                  name="descripcion_contexto_local"
                  value={form.descripcion_contexto_local}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe el entorno socioeconómico de las familias, ubicación geográfica y potencial cultural local..."
                  className="px-4 py-3 rounded-xl border border-border-custom bg-slate-50 focus:outline-none focus:bg-white focus:border-morado-ia focus:ring-1 focus:ring-morado-ia text-sm text-slate-900 transition-all resize-none font-body"
                />
              </div>
            </div>

            {/* Enfoques Transversales */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Enfoques Transversales Priorizados
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
            </div>

            {/* Organización del Tiempo */}
            <div className="flex flex-col gap-4 border-t border-border-custom pt-5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Organización de los Periodos Escolares
                </label>
                <div className="bg-slate-100 p-0.5 rounded-lg flex">
                  <button
                    type="button"
                    onClick={() => handleToggleTiempo("bimestres")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      activeTabTiempo === "bimestres" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Bimestres
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleTiempo("trimestres")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      activeTabTiempo === "trimestres" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Trimestres
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 border border-border-custom rounded-xl">
                {Object.keys(form.organizacion_tiempo).map((period) => (
                  <div key={period} className="flex flex-col gap-2 p-3 bg-white border border-border-custom rounded-lg shadow-sm">
                    <span className="text-xs font-bold text-slate-800">{period}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Inicio</span>
                        <input
                          type="date"
                          value={form.organizacion_tiempo[period].inicio}
                          onChange={(e) => handleDateChange(period, "inicio", e.target.value)}
                          className="px-2 py-1.5 border border-border-custom rounded-md text-xs focus:outline-none focus:border-morado-ia"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Fin</span>
                        <input
                          type="date"
                          value={form.organizacion_tiempo[period].fin}
                          onChange={(e) => handleDateChange(period, "fin", e.target.value)}
                          className="px-2 py-1.5 border border-border-custom rounded-md text-xs focus:outline-none focus:border-morado-ia"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Constructor del Árbol Curricular CNEB */}
        {step === 3 && (
          <div className="p-7 flex flex-col gap-6">
            <h2 className="font-headings font-bold text-slate-900 text-base border-b border-border-custom pb-3">
              🎯 3. Constructor del Árbol Curricular CNEB
            </h2>

            {/* Selector de Competencias del Catálogo */}
            <div className="p-4 border border-border-custom bg-slate-50/50 rounded-2xl flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-700">Agregar Competencias del Catálogo Nacional</span>
              <div className="flex gap-2">
                <select
                  value={selectedCompId}
                  onChange={(e) => setSelectedCompId(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border-custom bg-white text-sm focus:outline-none focus:border-morado-ia"
                >
                  <option value="">-- Selecciona una competencia sugerida --</option>
                  {currentCatalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.id}] {c.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddCompetenciaCatalog}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  + Agregar
                </button>
              </div>

              {/* Si es un área no pre-cargada o quieren agregar una libre */}
              <div className="border-t border-dashed border-slate-200 pt-3 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-500">¿Competencia Personalizada / Otra Área?</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Ej: C1, C5, etc. (Opcional)"
                    value={customCompId}
                    onChange={(e) => setCustomCompId(e.target.value)}
                    className="w-full sm:w-1/4 px-3 py-2 border border-border-custom bg-white rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Nombre completo de la competencia..."
                    value={customCompNombre}
                    onChange={(e) => setCustomCompNombre(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border-custom bg-white rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompetenciaCustom}
                    className="px-5 py-2 bg-morado-ia text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  >
                    + Personalizada
                  </button>
                </div>
              </div>
            </div>

            {/* Listado de Competencias seleccionadas */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Árbol Curricular Seleccionado ({form.competencias_anuales.length})
              </span>

              {form.competencias_anuales.length === 0 ? (
                <div className="p-8 border border-dashed border-border-custom rounded-2xl text-center text-xs text-slate-400 font-semibold">
                  No hay competencias agregadas todavía. Utiliza los selectores de arriba para armar el árbol.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {form.competencias_anuales.map((comp) => {
                    // Buscar sugerencias en el catálogo
                    const catalogItem = currentCatalog.find((c) => c.id === comp.competencia_id || c.nombre === comp.nombre);
                    
                    return (
                      <div
                        key={comp.competencia_id}
                        className="border border-border-custom rounded-2xl p-5 bg-white shadow-sm flex flex-col gap-4"
                      >
                        {/* Cabecera Tarjeta */}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-slate-500">
                              {comp.competencia_id}
                            </span>
                            <h4 className="font-headings font-bold text-sm text-slate-900 mt-1">
                              {comp.nombre}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCompetencia(comp.competencia_id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>

                        {/* Capacidades */}
                        <div className="border-t border-dashed border-slate-100 pt-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                            Capacidades Priorizadas (Selecciona las que se trabajarán)
                          </span>
                          <div className="flex flex-col gap-2">
                            {/* Mostrar capacidades del catálogo */}
                            {catalogItem?.capacidades.map((cap) => {
                              const checked = comp.capacidades.includes(cap);
                              return (
                                <label key={cap} className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleToggleCapacidad(comp.competencia_id, cap)}
                                    className="mt-0.5 accent-morado-ia"
                                  />
                                  <span>{cap}</span>
                                </label>
                              );
                            })}

                            {/* Mostrar capacidades adicionales agregadas libremente */}
                            {comp.capacidades
                              .filter((cap) => !catalogItem?.capacidades.includes(cap))
                              .map((cap) => (
                                <label key={cap} className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={() => handleToggleCapacidad(comp.competencia_id, cap)}
                                    className="mt-0.5 accent-morado-ia"
                                  />
                                  <span className="text-morado-ia">{cap} (Personalizada)</span>
                                </label>
                              ))}

                            {/* Campo para agregar capacidad manual */}
                            <div className="flex gap-2 mt-2 max-w-md">
                              <input
                                type="text"
                                placeholder="Escribe otra capacidad..."
                                value={customCapName}
                                onChange={(e) => setCustomCapName(e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-border-custom rounded-lg text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddCustomCapacidad(comp.competencia_id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                              >
                                + Agregar
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Desempeños Priorizados */}
                        <div className="border-t border-dashed border-slate-100 pt-3 flex flex-col gap-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Desempeños de Grado Priorizados ({comp.desempeños_priorizados.length})
                          </span>

                          {/* Listado de desempeños agregados */}
                          {comp.desempeños_priorizados.length > 0 && (
                            <div className="flex flex-col gap-2">
                              {comp.desempeños_priorizados.map((d, dIdx) => (
                                <div key={dIdx} className="flex justify-between items-start gap-3 p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700">
                                  <span className="flex-1 leading-relaxed">{d}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDesempeno(comp.competencia_id, d)}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 shrink-0 mt-0.5 cursor-pointer"
                                  >
                                    Remover
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Sugerencias de desempeño (Catálogo) */}
                          {catalogItem?.desempenos && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sugerencias del CNEB:</span>
                              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto border border-slate-100 p-2 rounded-lg">
                                {catalogItem.desempenos
                                  .filter((d: string) => !comp.desempeños_priorizados.includes(d))
                                  .map((d: string, sIdx: number) => (
                                    <button
                                      key={sIdx}
                                      type="button"
                                      onClick={() => handleAddDesempeno(comp.competencia_id, d)}
                                      className="text-left text-xs p-1.5 bg-white border border-slate-100 hover:border-morado-ia hover:bg-slate-50 rounded text-slate-600 transition-all font-body cursor-pointer"
                                    >
                                      + {d}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Input manual de desempeño */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escribir Desempeño Manual:</span>
                            <div className="flex gap-2">
                              <textarea
                                placeholder="Escribe el desempeño priorizado o redactado por ti..."
                                value={customDesempeno}
                                onChange={(e) => setCustomDesempeno(e.target.value)}
                                rows={2}
                                className="flex-1 px-3 py-2 border border-border-custom rounded-lg text-xs font-body resize-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleAddDesempeno(comp.competencia_id, customDesempeno);
                                  setCustomDesempeno("");
                                }}
                                className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                              >
                                Agregar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paso 4: Resumen y Generar */}
        {step === 4 && (
          <div className="p-7 flex flex-col gap-5">
            <h2 className="font-headings font-bold text-slate-900 text-base border-b border-border-custom pb-3">
              🎯 4. Resumen y Generar Documento
            </h2>

            {/* Resumen de Datos */}
            <div className="bg-slate-50 border border-border-custom rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-body">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block">DRE / UGEL:</span>
                <span className="font-semibold text-slate-800">{form.dre || "—"} / {form.ugel || "—"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Institución Educativa:</span>
                <span className="font-semibold text-slate-800">{form.institucion_educativa || "—"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Área y Grado:</span>
                <span className="font-semibold text-slate-800">{form.area_curricular} — {form.grado} ({form.seccion})</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Ciclo y Turno:</span>
                <span className="font-semibold text-slate-800">{form.ciclo} — Turno {form.turno}</span>
              </div>
              <div className="col-span-1 md:col-span-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Organización del Tiempo:</span>
                <span className="font-semibold text-slate-800">
                  {Object.entries(form.organizacion_tiempo)
                    .map(([k, v]) => `${k} (${v.inicio} a ${v.fin})`)
                    .join(", ")}
                </span>
              </div>
              <div className="col-span-1 md:col-span-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Enfoques Transversales:</span>
                <span className="font-semibold text-slate-800">
                  {form.enfoques_transversales.length > 0
                    ? form.enfoques_transversales.join(", ")
                    : "Ninguno seleccionado"}
                </span>
              </div>
              <div className="col-span-1 md:col-span-2 border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider">
                  Árbol Curricular Configurado ({form.competencias_anuales.length} competencias):
                </span>
                <ul className="mt-1 list-disc pl-4 space-y-1 text-slate-700">
                  {form.competencias_anuales.map((c) => (
                    <li key={c.competencia_id} className="font-medium">
                      [{c.competencia_id}] {c.nombre} (Capacidades: {c.capacidades.length}, Desempeños: {c.desempeños_priorizados.length})
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Banner IA */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-xs">
              <span className="text-blue-500 text-base mt-0.5">🤖</span>
              <div>
                <p className="font-bold text-blue-700">El motor de IA generará en el documento:</p>
                <ul className="mt-1 text-blue-600 font-semibold list-disc pl-4 space-y-0.5">
                  <li>Propósitos y metas anuales por bimestre/trimestre.</li>
                  <li>Secuencias completas de unidades didácticas heredables.</li>
                  <li>Situación significativa anual integradora y criterios de evaluación CNEB.</li>
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
                ✅ ¡Plan Curricular Anual generado y descargado como .docx!
              </div>
            )}
          </div>
        )}

        {/* Barra de Navegación entre pasos */}
        <div className="px-7 py-5 border-t border-border-custom bg-slate-50/60 flex justify-between">
          <button
            type="button"
            onClick={() => step > 1 && setStep((s) => (s - 1) as Step)}
            disabled={step === 1}
            className="px-5 py-2 rounded-xl border border-border-custom text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
          >
            ← Anterior
          </button>
          {step < 4 ? (
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
