"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/config/api";

export default function AdminUploadPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificación de rol de ADMIN
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (userObj.role === "ADMIN") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            // Redirigir al dashboard tras 3 segundos
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          }
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setFile(selectedFile);
    } else {
      setErrorMessage("Formato no soportado. Por favor, selecciona únicamente archivos PDF.");
      setFile(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/rag/upload`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Fallo al indexar el documento.");
      }

      const data = await response.json();
      setSuccessMessage(
        `¡Excelente! El archivo "${data.filename}" ha sido indexado con éxito. Se generaron e insertaron ${data.chunks_indexed} fragmentos semánticos en la base de datos vectorial de PostgreSQL.`
      );
      setFile(null);
    } catch (err: any) {
      let msg = "Ocurrió un error al indexar el documento.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.detail) msg = parsed.detail;
      } catch {
        if (err.message) msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse font-body">
          Verificando permisos de seguridad de AVENDIA...
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center font-body">
        <div className="max-w-md bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex flex-col gap-3 text-center shadow-sm">
          <span className="text-3xl">🚫</span>
          <h2 className="font-headings font-bold text-lg">Acceso No Autorizado</h2>
          <p className="text-xs leading-relaxed">
            Tu rol actual no tiene privilegios de administrador para acceder a esta ruta. Serás redirigido al panel principal en unos instantes.
          </p>
        </div>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <main className="p-8 flex flex-col gap-6 font-body">
      <div>
        <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
          Consola RAG - Cargar Leyes y Normativas
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Sube los libros de reglamentos o normativas en formato PDF para extraer su texto, generar embeddings inteligentes y dotar de conocimiento a EduAsesor.
        </p>
      </div>

      <div className="max-w-3xl bg-white border border-border-custom rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl text-xs font-semibold leading-relaxed">
            🟢 {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-morado-ia bg-morado-ia/5 scale-[0.99]"
              : "border-border-custom bg-bg-main hover:bg-slate-50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf"
            className="hidden"
          />
          <div className="w-14 h-14 rounded-full bg-morado-ia/10 flex items-center justify-center text-morado-ia text-2xl">
            📂
          </div>
          <div>
            <h3 className="font-headings font-bold text-sm text-slate-800">
              {dragOver ? "¡Suelta el archivo aquí!" : "Arrastra y suelta tu archivo PDF aquí"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              o haz clic para explorar tus carpetas locales
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold border border-slate-200">
            SOLO ARCHIVOS .PDF
          </span>
        </div>

        {/* Vista previa del archivo seleccionado */}
        {file && (
          <div className="flex justify-between items-center bg-bg-main p-4 rounded-xl border border-border-custom gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-2xl shrink-0">📄</span>
              <div className="overflow-hidden">
                <span className="block text-xs font-bold text-slate-800 truncate max-w-xs md:max-w-sm">
                  {file.name}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  {formatSize(file.size)}
                </span>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-azul-educativo to-morado-ia hover:opacity-95 text-white font-headings font-bold text-xs shadow-md transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Indexar en Base de Conocimientos
            </button>
          </div>
        )}

        {/* Loader modal de carga de indexación */}
        {isLoading && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white border border-border-custom rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 text-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-morado-ia rounded-full animate-spin" />
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="font-headings font-bold text-base text-slate-900 leading-tight">
                  Procesando PDF normativo...
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Procesando PDF, extrayendo texto y generando embeddings vectoriales de Gemini... Por favor, no cierre esta ventana.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
