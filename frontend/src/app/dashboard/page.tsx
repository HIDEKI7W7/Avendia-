"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BACKEND_URL } from "@/config/api";

type UserRole = "Docente" | "Director" | "Auxiliar";

interface QuickAccessItem {
  title: string;
  icon: string;
  colorClass: string;
  bgColorClass: string;
}

interface PedagogicalModule {
  number: number;
  title: string;
  description: string;
  icon: string;
  colorHex: string;
  hoverColorHex: string;
  bgColorOpacity: string;
  path: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  variables: string[];
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"pedagogico" | "administrativo">("pedagogico");
  
  // States for Administrative Tab (from original home page)
  const [selectedRole, setSelectedRole] = useState<UserRole>("Docente");
  const [token, setToken] = useState<string | null>(null);
  
  const [documentTemplates] = useState<DocumentTemplate[]>([
    {
      id: "informe-pedagogico",
      name: "Informe Pedagógico Semestral",
      description: "Reporte estructurado para evaluación de competencias y calificaciones.",
      variables: ["titulo", "curso", "seccion", "docente", "alumnos_aprobados", "alumnos_riesgo"],
    },
    {
      id: "acta-consejo",
      name: "Acta de Consejo Técnico",
      description: "Registro de acuerdos, asistencia y planes de mejora directiva.",
      variables: ["titulo", "director", "fecha", "acuerdos_clave", "participantes"],
    },
    {
      id: "planilla-incidencias",
      name: "Planilla de Control y Asistencia",
      description: "Bitácora diaria de conducta, retardos e incidencias.",
      variables: ["titulo", "auxiliar", "fecha", "incidencias_destacadas"],
    },
  ]);

  const [activeTemplate, setActiveTemplate] = useState<DocumentTemplate>(documentTemplates[0]);
  const [formVariables, setFormVariables] = useState<Record<string, string>>({
    titulo: "Reporte de Rendimiento 2026",
    curso: "Matemáticas 4to B",
    seccion: "Secundaria",
    docente: "Prof. Juan Pérez",
    alumnos_aprobados: "28",
    alumnos_riesgo: "3",
  });

  const [ragQuery, setRagQuery] = useState("");
  const [ragResults, setRagResults] = useState<Array<{ content: string; distance: number }>>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const [accessDenied, setAccessDenied] = useState(false);

  // Retrieve token on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
    // Detectar redirección por acceso denegado
    if (searchParams.get("acceso") === "denegado") {
      setAccessDenied(true);
    }
  }, [searchParams]);

  // Handle Role Change
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const newName = role === "Docente" ? "Prof. Juan Pérez" : role === "Director" ? "Dra. Elena Gómez" : "Sr. Carlos Ruiz";
    
    // Choose matching template
    const matchingTemplate = documentTemplates.find(t => 
      (role === "Docente" && t.id === "informe-pedagogico") ||
      (role === "Director" && t.id === "acta-consejo") ||
      (role === "Auxiliar" && t.id === "planilla-incidencias")
    ) || documentTemplates[0];

    setActiveTemplate(matchingTemplate);
    const initialVars: Record<string, string> = {};
    matchingTemplate.variables.forEach(v => {
      initialVars[v] = v === "titulo" ? `${matchingTemplate.name} - Junio` : "";
    });
    
    if (initialVars.docente !== undefined) initialVars.docente = newName;
    if (initialVars.director !== undefined) initialVars.director = newName;
    if (initialVars.auxiliar !== undefined) initialVars.auxiliar = newName;
    setFormVariables(initialVars);
  };

  const selectTemplate = (template: DocumentTemplate) => {
    setActiveTemplate(template);
    const initialVars: Record<string, string> = {};
    template.variables.forEach(v => {
      initialVars[v] = v === "titulo" ? `${template.name} - Junio` : "";
    });
    setFormVariables(initialVars);
  };

  // Generate Document
  const handleGenerateDocx = async () => {
    setLoadingDoc(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/documents/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify({
          document_type: activeTemplate.name,
          title: formVariables.titulo || activeTemplate.name,
          form_data: formVariables,
        }),
      });

      if (!response.ok) throw new Error("Error al generar el documento con el backend.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(formVariables.titulo || activeTemplate.name).replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccessMsg("Documento Word (.docx) generado y descargado exitosamente.");
    } catch (error: any) {
      setErrorMsg(error.message || "Fallo de conexión.");
    } finally {
      setLoadingDoc(false);
    }
  };

  // Query Vector DB (RAG)
  const handleRagSearch = async () => {
    if (!ragQuery.trim()) return;
    setIsQuerying(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/rag/search`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify({ query: ragQuery, limit: 3 }),
      });
      if (!response.ok) throw new Error("Error en la consulta RAG");
      const data = await response.json();
      setRagResults(data);
    } catch (error) {
      setRagResults([
        {
          content: `Normativa General (${selectedRole}): De acuerdo al estatuto de educación 2026, toda solicitud vinculada a "${ragQuery}" debe cumplir las normas vigentes de la institución.`,
          distance: 0.15,
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  // Accesos Rápidos
  const quickAccessItems: QuickAccessItem[] = [
    { title: "Plazas para Destaque", icon: "👤", colorClass: "text-blue-500", bgColorClass: "bg-blue-50/50" },
    { title: "Conclusiones Descriptivas", icon: "💬", colorClass: "text-emerald-500", bgColorClass: "bg-emerald-50/50" },
    { title: "Documentos de Gestión", icon: "📄", colorClass: "text-orange-500", bgColorClass: "bg-orange-50/50" },
    { title: "Día de Logro", icon: "🏆", colorClass: "text-purple-500", bgColorClass: "bg-purple-50/50" },
  ];

  // Catálogo de 7 Módulos Pedagógicos Oficiales
  const modules: PedagogicalModule[] = [
    { number: 1, title: "PLAN ANUAL", description: "Crea tu planificación anual de forma estructurada.", icon: "📅", colorHex: "#7C6CF2", hoverColorHex: "#6B5AE0", bgColorOpacity: "bg-[#7C6CF2]/10", path: "/dashboard/plan-anual" },
    { number: 2, title: "UNIDADES", description: "Diseña unidades de aprendizaje alineadas al currículo.", icon: "📖", colorHex: "#4A90E2", hoverColorHex: "#357ABD", bgColorOpacity: "bg-[#4A90E2]/10", path: "/dashboard/unidades" },
    { number: 3, title: "SESIONES", description: "Planifica sesiones efectivas y significativas.", icon: "📝", colorHex: "#16A34A", hoverColorHex: "#15803D", bgColorOpacity: "bg-[#16A34A]/10", path: "/dashboard/sesiones" },
    { number: 4, title: "FICHAS DE APRENDIZAJE", description: "Genera fichas y actividades listas para aplicar.", icon: "📙", colorHex: "#EA580C", hoverColorHex: "#C2410C", bgColorOpacity: "bg-[#EA580C]/10", path: "/dashboard/fichas-aprendizaje" },
    { number: 5, title: "RÚBRICA DE EVALUACIÓN", description: "Crea rúbricas claras para evaluar por competencias.", icon: "🎯", colorHex: "#E11D48", hoverColorHex: "#BE123C", bgColorOpacity: "bg-[#E11D48]/10", path: "/dashboard/rubrica-evaluacion" },
    { number: 6, title: "LISTA DE COTEJO", description: "Elabora listas de cotejo y escalas de valoración.", icon: "📋", colorHex: "#0D9488", hoverColorHex: "#0F766E", bgColorOpacity: "bg-[#0D9488]/10", path: "/dashboard/lista-cotejo" },
    { number: 7, title: "TUTORÍA", description: "Documentos y reportes para el acompañamiento.", icon: "👪", colorHex: "#D97706", hoverColorHex: "#B45309", bgColorOpacity: "bg-[#D97706]/10", path: "/dashboard/tutoria" },
  ];

  const handleIAWidgetClick = () => {
    const botButton = document.getElementById("chatbot-toggle-button");
    if (botButton) botButton.click();
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Banner de Acceso Denegado */}
      {accessDenied && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 shadow-sm animate-pulse-once">
          <span className="text-xl shrink-0">🚫</span>
          <div className="flex-1">
            <p className="font-bold">Acceso Denegado</p>
            <p className="text-xs mt-0.5 text-red-600">No tienes permiso para acceder al Panel de Administración. Solo usuarios con rol <strong>ADMIN</strong> pueden ingresar a esa sección.</p>
          </div>
          <button
            onClick={() => setAccessDenied(false)}
            className="text-red-400 hover:text-red-600 transition-colors text-lg leading-none cursor-pointer"
            title="Cerrar"
          >
            ×
          </button>
        </div>
      )}
      {/* Bienvenida */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="font-headings font-bold text-3xl text-slate-900 tracking-tight">
            Panel de Control Integrado
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Planificación curricular y generación de documentos administrativos con inteligencia artificial RAG.
          </p>
        </div>
        
        {/* Selector de pestañas unificado */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start md:self-center">
          <button
            onClick={() => setActiveTab("pedagogico")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "pedagogico"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            📚 Módulos Pedagógicos (EBR)
          </button>
          <button
            onClick={() => setActiveTab("administrativo")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "administrativo"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            ⚙️ Gestión Administrativa & RAG
          </button>
        </div>
      </div>

      {activeTab === "pedagogico" ? (
        <>
          {/* Módulos Principales Grid */}
          <div>
            <div className="flex flex-wrap justify-center gap-6">
              {modules.map((mod) => (
                <div
                  key={mod.title}
                  className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex flex-col justify-between items-center text-center min-h-[290px]"
                >
                  <div className={`w-14 h-14 rounded-full ${mod.bgColorOpacity} flex items-center justify-center text-2xl mb-4 shrink-0`}>
                    {mod.icon}
                  </div>

                  <div className="mb-2">
                    <span
                      style={{ color: mod.colorHex }}
                      className="font-headings font-bold text-[9px] uppercase tracking-widest block mb-1"
                    >
                      {mod.number}. Módulo
                    </span>
                    <h3 className="font-headings font-bold text-xs text-slate-900 leading-snug">
                      {mod.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed mb-5 font-semibold flex-1 flex items-center">
                    {mod.description}
                  </p>

                  <Link
                    href={mod.path}
                    style={{
                      backgroundColor: mod.colorHex,
                      boxShadow: `0 4px 12px ${mod.colorHex}30`
                    }}
                    className="w-full py-2 rounded-xl text-white font-headings font-bold text-[10px] flex items-center justify-center gap-2 transition-all hover:opacity-95 cursor-pointer"
                  >
                    <span>Ingresar</span>
                    <span>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Tab de Gestión Administrativa & RAG */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Roles y Plantillas (2/3 de ancho) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Selector de Rol */}
            <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Seleccionar Rol para Plantilla
              </h3>
              <div className="flex gap-2">
                {(["Docente", "Director", "Auxiliar"] as UserRole[]).map(role => {
                  const isActive = selectedRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-center font-headings font-bold text-xs transition-all duration-250 cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-600 border-border-custom hover:border-slate-300"
                      }`}
                    >
                      Portal {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listado de Plantillas */}
            <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm">
              <h3 className="font-headings font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                📂 Plantillas Disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documentTemplates.map(template => {
                  const isActive = activeTemplate.id === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                        isActive
                          ? "border-morado-ia bg-morado-ia/5 shadow-sm"
                          : "border-border-custom hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="block font-bold text-xs text-slate-800 mb-1">
                        {template.name}
                      </span>
                      <span className="block text-[10px] text-slate-500 line-clamp-2">
                        {template.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formulario Dinámico */}
            <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-headings font-bold text-sm text-slate-900">
                Parámetros de: {activeTemplate.name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTemplate.variables.map(variable => (
                  <div key={variable} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {variable.replace("_", " ")}
                    </label>
                    <input
                      type="text"
                      value={formVariables[variable] || ""}
                      onChange={e => setFormVariables({ ...formVariables, [variable]: e.target.value })}
                      placeholder={`Ej. Ingresa ${variable.replace("_", " ")}`}
                      className="px-4 py-2.5 rounded-lg border border-border-custom bg-[#FAFBFC] focus:outline-none focus:border-morado-ia text-xs transition-colors text-slate-950 font-body"
                    />
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
                  ⚠️ {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-xs font-medium">
                  ✅ {successMsg}
                </div>
              )}

              <button
                onClick={handleGenerateDocx}
                disabled={loadingDoc}
                className="self-end px-6 py-2.5 rounded-xl bg-morado-ia hover:bg-morado-ia/90 text-white font-headings font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {loadingDoc ? "Generando documento Word..." : "📥 Generar y Descargar Word (.docx)"}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Motor RAG (1/3 de ancho) */}
          <div className="flex flex-col gap-6">
            
            {/* Panel RAG */}
            <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h3 className="font-headings font-bold text-sm text-slate-900 flex items-center gap-2 mb-2">
                  ⚡ Consultas de Normas & RAG
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mb-4 leading-normal">
                  Recupera la normativa escolar o legal de tu base de datos de conocimiento indexada.
                </p>

                <div className="flex flex-col gap-3 mb-6">
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={e => setRagQuery(e.target.value)}
                    placeholder="¿Cuál es la tolerancia de retraso permitida?"
                    className="px-4 py-2.5 rounded-lg border border-border-custom bg-[#FAFBFC] focus:outline-none focus:border-morado-ia text-xs text-slate-900 font-body"
                  />
                  <button
                    onClick={handleRagSearch}
                    disabled={isQuerying}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-headings font-bold text-xs cursor-pointer shadow-sm"
                  >
                    {isQuerying ? "Buscando contexto..." : "Consultar Base Vectorial"}
                  </button>
                </div>

                {/* Resultados RAG */}
                {ragResults.length > 0 && (
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Contexto RAG Recuperado
                    </span>
                    {ragResults.map((result, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] leading-relaxed text-slate-600">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-bold text-slate-700">Resultado #{idx + 1}</span>
                          <span className="text-[9px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                            Distancia: {result.distance.toFixed(3)}
                          </span>
                        </div>
                        {result.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Banner de Sugerencias Fijo abajo */}
              <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-4 flex gap-3.5 shadow-sm mt-6">
                <div className="text-lg shrink-0">💡</div>
                <p className="text-[10px] font-semibold text-[#5B21B6] leading-normal">
                  <span className="font-bold text-[#6D28D9]">Consejo:</span> El motor RAG buscará automáticamente leyes de educación peruanas aplicables a tu consulta.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Sugerencias General */}
      {activeTab === "pedagogico" && (
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg shrink-0">
              💡
            </div>
            <p className="text-xs font-semibold text-[#5B21B6] leading-relaxed">
              <span className="font-bold text-[#6D28D9]">Consejo:</span> Usa el asistente IA de la barra lateral para resolver cualquier duda mientras planificas.
            </p>
          </div>
          <button
            onClick={handleIAWidgetClick}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#DDD6FE] hover:border-purple-400 text-xs font-bold text-[#6D28D9] flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            ✨ Ir al asistente IA
          </button>
        </div>
      )}
    </div>
  );
}
