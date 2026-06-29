"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileUp, 
  Sparkles, 
  FileCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  ClipboardList
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TARJETA DE CARGA BENTO REUTILIZABLE
// ═══════════════════════════════════════════════════════════════════════════
function UploadCard({ title, templateName }: { title: string; templateName: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    setError(null);
    setSuccess(false);
    setProgress(0);

    const isDocx = selectedFile.name.endsWith(".docx") || selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isDocx) {
      setError("Por favor, sube únicamente archivos Word (.docx).");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setSuccess(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleCancel = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setSuccess(false);
    setError(null);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm hover:shadow-[0_20px_50px_rgba(124,108,242,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[420px] relative">
      <div className="flex flex-col gap-4">
        {/* Header Interno */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-[#4A90E2] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="font-montserrat font-bold text-lg text-slate-800 dark:text-white leading-tight">
            {title}
          </h3>
        </div>

        {/* Zona Drag & Drop / Upload Progress */}
        {!uploading && !success && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 py-10 ${
              dragActive 
                ? "border-[#7C6CF2] bg-[#7C6CF2]/5" 
                : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-[#7C6CF2]/65 hover:bg-[#7C6CF2]/5"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleChange}
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#7C6CF2]/8 text-[#7C6CF2] flex items-center justify-center shrink-0">
              <FileUp className="w-6 h-6 text-[#7C6CF2]" />
            </div>
            {file ? (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                  📄 {file.name}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                  ({(file.size / 1024).toFixed(1)} KB) · Haz clic para cambiar
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-350">
                  Arrastra tu archivo aquí o haz clic para explorar
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold leading-normal">
                  Formato aceptado: Microsoft Word (.docx)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Cargando progreso */}
        {uploading && (
          <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 rounded-2xl p-6 flex flex-col justify-center gap-4 py-10">
            <div className="flex justify-between items-center text-xs font-bold text-slate-650 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#7C6CF2] animate-spin" />
                Mapeando estructura...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#4A90E2] to-[#7C6CF2] rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold text-center">
              Reconociendo márgenes, encabezados y logos del colegio...
            </span>
          </div>
        )}

        {/* Éxito */}
        {success && (
          <div className="border border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/20 dark:bg-emerald-950/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 py-10 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-emerald-800 dark:text-emerald-400">
                ¡Formato cargado con éxito!
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-450 mt-1 max-w-[220px] mx-auto leading-normal font-semibold">
                Nuestra IA ha mapeado los estilos de tu Word escolar. Se aplicará a tus futuras descargas.
              </span>
            </div>
            <button
              onClick={handleCancel}
              className="text-[10px] font-bold text-[#7C6CF2] hover:underline cursor-pointer"
            >
              Reemplazar formato
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/10 text-red-700 dark:text-red-400 text-[10px] font-bold leading-normal">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Globo de Alerta de Validación (Mascota Kawaii) */}
        <div className="flex gap-3 bg-[#7C6CF2]/5 dark:bg-[#7C6CF2]/10 border border-[#7C6CF2]/10 dark:border-[#7C6CF2]/20 rounded-2xl p-3.5 relative overflow-hidden select-none">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#7C6CF2]/10 border border-[#7C6CF2]/20 shadow-inner">
            <img src="/teacher_loading_asset.png" alt="Mascota" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-slate-700 dark:text-slate-350 font-semibold leading-relaxed">
              <span className="font-bold text-[#7C6CF2]">Consejo Profe:</span> Sube solo el esqueleto vacío del colegio (sin contenido lleno).
            </p>
            <a 
              href={`/${templateName}`}
              download
              className="text-[10px] text-[#7C6CF2] dark:text-[#9A8DFF] font-bold hover:underline flex items-center gap-1 mt-0.5"
            >
              Ver ejemplo plantilla 📄
            </a>
          </div>
        </div>
      </div>

      {/* Botón de Acción */}
      {!success && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4A90E2] to-[#7C6CF2] text-white font-headings font-extrabold text-xs uppercase tracking-widest shadow-md shadow-[#7C6CF2]/15 hover:brightness-105 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>Subir Formato</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function FormatoPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12 font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* ── A. ENCABEZADO DE LA SECCIÓN (Header) ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#7C6CF2]/10 text-[#7C6CF2] flex items-center justify-center shadow-inner">
            <ClipboardList className="w-6.5 h-6.5 text-[#7C6CF2]" />
          </div>
          <h1 className="text-3xl font-montserrat font-black text-slate-900 dark:text-white tracking-tight">
            Formato escolar
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-2xl leading-relaxed">
          Sube el formato Word de tu colegio y nuestra IA lo adaptará automáticamente. Cada vez que descargues una sesión o unidad, se exportará directamente con tu diseño institucional adaptado.
        </p>
      </div>

      {/* ── B. GRID DE CARGA DE FORMATOS (The Twin Upload Bento Cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <UploadCard title="Planificación de Clase (PDC / Sesiones)" templateName="plantilla_clase_minedu.docx" />
        <UploadCard title="Unidad de Aprendizaje" templateName="plantilla_unidad_aprendizaje.docx" />
      </div>

      {/* ── C. COMPONENTE INTERACTIVO: "¿CÓMO FUNCIONA?" (THE VISUAL TIMELINE) ── */}
      <div className="mt-12 flex flex-col gap-6">
        <div className="text-center md:text-left">
          <h2 className="font-montserrat font-black text-xl text-slate-900 dark:text-white tracking-tight">
            ¿Cómo funciona?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Sigue estos 3 sencillos pasos para que la inteligencia artificial se encargue de tus diseños institucionales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Paso 1 */}
          <div className="bg-white/50 dark:bg-slate-900/30 border border-white/20 dark:border-slate-850/50 rounded-3xl p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-[#4A90E2] flex items-center justify-center shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                1. Sube tu Word
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1.5">
                Carga la plantilla de tu institución tal y como la tienes, respetando logos y tablas básicas.
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="bg-white/50 dark:bg-slate-900/30 border border-white/20 dark:border-slate-850/50 rounded-3xl p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-[#7C6CF2] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                2. Detección Inteligente
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1.5">
                Nuestra IA mapea y reconoce los campos, tipografías y tablas de tu colegio en segundos.
              </p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="bg-white/50 dark:bg-slate-900/30 border border-white/20 dark:border-slate-850/50 rounded-3xl p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-[#34D399] flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                3. Descarga Personalizada
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1.5">
                ¡Listo! Tus futuras sesiones y unidades se descargarán directamente empotrados en tu formato escolar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
