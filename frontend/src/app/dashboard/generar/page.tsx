"use client";

import React, { useState } from "react";
import { generateAndDownloadDocument } from "@/services/documentService";

export default function GenerarDocumentoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    grade_section: "4to A",
    purpose: "",
    comments: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Formatear payload para inyectar en RAG y Gemini
      const payload = {
        title: formData.title,
        grado_seccion: formData.grade_section,
        propósito_pedagogico: formData.purpose,
        comentarios_adicionales: formData.comments,
      };

      await generateAndDownloadDocument("Sesión de Aprendizaje", payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al descargar el archivo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
          Generar Sesión de Aprendizaje
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-body">
          Introduce los datos para estructurar tu documento y la IA lo redactará considerando el contexto legal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border-custom rounded-xl p-6 shadow-sm flex flex-col gap-5">
        
        {/* Título de la Sesión */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Título de la Sesión
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Ej: Introducción a fracciones equivalentes"
            className="px-4 py-2.5 rounded-lg border border-border-custom bg-[#FAFBFC] focus:outline-none focus:border-azul-educativo text-sm text-slate-900 transition-colors font-body"
          />
        </div>

        {/* Grado y Sección */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Grado y Sección
          </label>
          <select
            name="grade_section"
            value={formData.grade_section}
            onChange={handleInputChange}
            className="px-4 py-2.5 rounded-lg border border-border-custom bg-[#FAFBFC] focus:outline-none focus:border-azul-educativo text-sm text-slate-900 transition-colors font-body"
          >
            <option value="1ro A">1ro Primaria - A</option>
            <option value="2do B">2do Primaria - B</option>
            <option value="3ro A">3ro Primaria - A</option>
            <option value="4to A">4to Primaria - A</option>
            <option value="5to B">5to Primaria - B</option>
            <option value="6to A">6to Primaria - A</option>
          </select>
        </div>

        {/* Propósito */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Propósito / Competencia a Evaluar
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Especifica las competencias del currículo nacional que evaluarás en esta sesión..."
            className="px-4 py-2.5 rounded-lg border border-border-custom bg-[#FAFBFC] focus:outline-none focus:border-azul-educativo text-sm text-slate-900 transition-colors font-body resize-y"
          />
        </div>

        {/* Comentarios Libres */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Comentarios Libres / Enfoque Pedagógico
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            rows={3}
            placeholder="Añade dinámicas adicionales o adaptaciones especiales para el aula..."
            className="px-4 py-2.5 rounded-lg border border-border-custom bg-[#FAFBFC] focus:outline-none focus:border-azul-educativo text-sm text-slate-900 transition-colors font-body resize-y"
          />
        </div>

        {/* Feedback de estados */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-body font-medium">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-xs font-body font-medium">
            ✅ ¡Documento Word (.docx) generado y descargado correctamente!
          </div>
        )}

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={loading}
          className="self-end px-6 py-3 rounded-lg bg-gradient-to-r from-azul-educativo to-morado-ia text-white font-headings font-semibold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all duration-200 cursor-pointer"
        >
          {loading ? "Redactando con IA..." : "Generar Documento (.docx)"}
        </button>

      </form>
    </main>
  );
}
