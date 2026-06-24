"use client";

import React from "react";
import { Printer, Eye, HelpCircle } from "lucide-react";

interface Competencia {
  competencia_id: string;
  nombre: string;
  capacidades: string[];
  desempeños_priorizados: string[];
}

interface PrintPreviewProps {
  type: "plan" | "rubrica" | "generico";
  data: {
    // Plan Anual fields
    dre?: string;
    ugel?: string;
    institucion_educativa?: string;
    area_curricular?: string;
    grado?: string;
    seccion?: string;
    ciclo?: string;
    turno?: string;
    ano_lectivo?: string | number;
    tiempo?: string;
    enfoques_transversales?: string[];
    competencias_anuales?: Competencia[];
    // Rubric fields
    nombre_rubrica?: string;
    proposito?: string;
    competencia_evaluar?: string;
    criterios?: Array<{
      criterio: string;
      inicio: string;
      proceso: string;
      logrado: string;
      destacado?: string;
    }>;
  };
}

export default function PrintPreview({ type, data }: PrintPreviewProps) {
  return (
    <div className="flex flex-col gap-4 font-body select-none">
      {/* Header bar for Preview */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4.5 h-4.5 text-[#7C6CF2]" />
          <span className="text-xs font-headings font-extrabold uppercase tracking-wider">
            Previsualización Física A4 (WYSIWYG)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/15 text-slate-350">
            Escala: Ajustada al ancho
          </span>
          <span title="Simular Impresión" className="inline-flex items-center">
            <Printer className="w-4 h-4 text-slate-300 hover:text-white transition-colors cursor-pointer" />
          </span>
        </div>
      </div>

      {/* Simulated A4 Paper */}
      <div className="relative w-full max-w-2xl mx-auto bg-white border border-slate-250 shadow-2xl rounded-2xl overflow-hidden aspect-[1/1.414] p-8 sm:p-12 text-[10px] text-black leading-relaxed">
        {/* Margin Guide Lines (Subtle preview helper) */}
        <div className="absolute inset-4 sm:inset-6 border border-dashed border-slate-150 rounded pointer-events-none select-none flex items-start justify-end p-2 opacity-30">
          <span className="text-[8px] text-slate-400 font-mono">Margen de Impresión</span>
        </div>

        {/* Paper Content Container */}
        <div className="w-full h-full flex flex-col justify-between relative z-10">
          {/* Header of the document */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
              <div>
                <span className="font-bold text-[8px] uppercase tracking-wider block">Ministerio de Educación</span>
                <span className="font-bold text-[8px] text-slate-500 uppercase tracking-wider block">Dirección Regional de Educación</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[8px] uppercase tracking-wider block">AVENDIA DOCENTE v2026</span>
                <span className="font-bold text-[8px] text-[#7C6CF2] uppercase tracking-wider block">Currículo Nacional CNEB</span>
              </div>
            </div>

            {/* Document Title */}
            {type === "plan" && (
              <h1 className="text-center font-headings font-extrabold text-xs uppercase tracking-wider border-2 border-black py-2 mb-4">
                Planificación Curricular Anual - {data.ano_lectivo || "2026"}
              </h1>
            )}
            {type === "rubrica" && (
              <h1 className="text-center font-headings font-extrabold text-xs uppercase tracking-wider border-2 border-black py-2 mb-4">
                Rúbrica de Evaluación Curricular - {data.ano_lectivo || "2026"}
              </h1>
            )}
            {type === "generico" && (
              <h1 className="text-center font-headings font-extrabold text-xs uppercase tracking-wider border-2 border-black py-2 mb-4">
                Documento de Trabajo Pedagógico
              </h1>
            )}

            {/* Informative Table */}
            <div className="mb-4">
              <h3 className="font-bold text-[9px] uppercase border-b border-black mb-1.5 pb-0.5">I. Datos Informativos</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 bg-slate-50/50 p-2.5 border border-slate-200 rounded">
                <div>
                  <span className="font-bold text-slate-500">I.E. / Colegio: </span>
                  <span className="font-semibold">{data.institucion_educativa || "—"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">DRE / UGEL: </span>
                  <span className="font-semibold">{data.dre || "—"} / {data.ugel || "—"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Área Curricular: </span>
                  <span className="font-semibold">{data.area_curricular || "—"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Grado y Sección: </span>
                  <span className="font-semibold">{data.grado || "—"} - {data.seccion || "Única"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Ciclo / Turno: </span>
                  <span className="font-semibold">{data.ciclo || "—"} / {data.turno || "—"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Horas Semanales / Periodo: </span>
                  <span className="font-semibold">{data.tiempo || "—"}</span>
                </div>
              </div>
            </div>

            {/* Plan-specific or Rubric-specific Content */}
            {type === "plan" && (
              <div className="flex flex-col gap-3">
                {/* Enfoques Transversales */}
                <div>
                  <h3 className="font-bold text-[9px] uppercase border-b border-black mb-1.5 pb-0.5">II. Enfoques Transversales Priorizados</h3>
                  <p className="font-medium text-[9px] text-slate-700 italic pl-1">
                    {data.enfoques_transversales && data.enfoques_transversales.length > 0
                      ? data.enfoques_transversales.join(", ")
                      : "No se priorizaron enfoques específicos para este año lectivo."}
                  </p>
                </div>

                {/* Competencias y Capacidades */}
                <div>
                  <h3 className="font-bold text-[9px] uppercase border-b border-black mb-1.5 pb-0.5">III. Matriz de Propósitos de Aprendizaje</h3>
                  {data.competencias_anuales && data.competencias_anuales.length > 0 ? (
                    <table className="w-full border-collapse border border-black text-[8px]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-black px-2 py-1 text-left w-1/4 font-bold uppercase">Competencia CNEB</th>
                          <th className="border border-black px-2 py-1 text-left w-1/3 font-bold uppercase">Capacidades Seleccionadas</th>
                          <th className="border border-black px-2 py-1 text-left w-5/12 font-bold uppercase">Desempeños de Grado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.competencias_anuales.slice(0, 3).map((comp) => (
                          <tr key={comp.competencia_id}>
                            <td className="border border-black px-2 py-1.5 font-bold uppercase vertical-top">
                              [{comp.competencia_id}] {comp.nombre}
                            </td>
                            <td className="border border-black px-2 py-1.5 vertical-top font-medium text-slate-700">
                              <ul className="list-disc pl-3.5 space-y-0.5">
                                {comp.capacidades.map((cap, cIdx) => (
                                  <li key={cIdx}>{cap}</li>
                                ))}
                              </ul>
                            </td>
                            <td className="border border-black px-2 py-1.5 vertical-top font-medium text-slate-600">
                              <ul className="list-decimal pl-3.5 space-y-0.5">
                                {comp.desempeños_priorizados.slice(0, 2).map((des, dIdx) => (
                                  <li key={dIdx} className="leading-snug">{des}</li>
                                ))}
                                {comp.desempeños_priorizados.length > 2 && (
                                  <li className="list-none text-slate-400 italic mt-0.5">
                                    + {comp.desempeños_priorizados.length - 2} desempeños adicionales...
                                  </li>
                                )}
                              </ul>
                            </td>
                          </tr>
                        ))}
                        {data.competencias_anuales.length > 3 && (
                          <tr>
                            <td colSpan={3} className="border border-black px-2 py-1 text-center font-bold text-slate-400 italic">
                              * El plan incluye {data.competencias_anuales.length - 3} competencias más que se imprimirán en las siguientes páginas del documento.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 border border-slate-200 border-dashed rounded text-center text-slate-400 font-semibold italic">
                      Debes agregar competencias y capacidades en el paso anterior para ver la matriz curricular aquí.
                    </div>
                  )}
                </div>
              </div>
            )}

            {type === "rubrica" && (
              <div className="flex flex-col gap-3">
                {/* Propósito de Evaluación */}
                <div>
                  <h3 className="font-bold text-[9px] uppercase border-b border-black mb-1.5 pb-0.5">II. Propósito y Criterios</h3>
                  <p className="font-medium text-slate-700 mb-1">
                    <span className="font-bold">Competencia: </span> {data.competencia_evaluar || "—"}
                  </p>
                  <p className="font-medium text-slate-700">
                    <span className="font-bold">Propósito de Evaluación: </span> {data.proposito || "—"}
                  </p>
                </div>

                {/* Rúbrica Table */}
                <div>
                  <h3 className="font-bold text-[9px] uppercase border-b border-black mb-1.5 pb-0.5">III. Matriz de Valoración de Criterios</h3>
                  {data.criterios && data.criterios.length > 0 ? (
                    <table className="w-full border-collapse border border-black text-[7px] leading-snug">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-black px-1.5 py-1 text-left w-1/5 font-bold uppercase">Criterio de Evaluación</th>
                          <th className="border border-black px-1.5 py-1 text-left w-1/5 font-bold uppercase">Inicio (C)</th>
                          <th className="border border-black px-1.5 py-1 text-left w-1/5 font-bold uppercase">Proceso (B)</th>
                          <th className="border border-black px-1.5 py-1 text-left w-1/5 font-bold uppercase">Logrado (A)</th>
                          <th className="border border-black px-1.5 py-1 text-left w-1/5 font-bold uppercase">Destacado (AD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.criterios.slice(0, 3).map((crit, cIdx) => (
                          <tr key={cIdx}>
                            <td className="border border-black px-1.5 py-1 font-bold text-slate-800 vertical-top">
                              {crit.criterio}
                            </td>
                            <td className="border border-black px-1.5 py-1 vertical-top text-slate-600 font-medium">
                              {crit.inicio}
                            </td>
                            <td className="border border-black px-1.5 py-1 vertical-top text-slate-600 font-medium">
                              {crit.proceso}
                            </td>
                            <td className="border border-black px-1.5 py-1 vertical-top text-slate-600 font-medium">
                              {crit.logrado}
                            </td>
                            <td className="border border-black px-1.5 py-1 vertical-top text-slate-600 font-medium">
                              {crit.destacado || "—"}
                            </td>
                          </tr>
                        ))}
                        {data.criterios.length > 3 && (
                          <tr>
                            <td colSpan={5} className="border border-black px-2 py-1 text-center font-bold text-slate-400 italic">
                              * La rúbrica incluye {data.criterios.length - 3} criterios más que se imprimirán en las siguientes páginas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 border border-slate-200 border-dashed rounded text-center text-slate-400 font-semibold italic">
                      Debes ingresar criterios de evaluación para ver la matriz de valoración.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer signature line */}
          <div className="flex justify-between items-end border-t border-black pt-2 mt-6">
            <div className="flex flex-col text-left">
              <span className="font-bold text-[8px]">Planificado con Asistencia de Inteligencia Artificial AVENDIA®</span>
              <span className="text-[7px] text-slate-500 font-medium">Este documento se emite con validez pedagógica curricular oficial.</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 border-b border-black border-dashed mb-1 h-8" />
              <span className="font-bold text-[8px] uppercase">Firma del Docente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
