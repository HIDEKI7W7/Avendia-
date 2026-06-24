"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";

import StepperBar from "@/components/salas/StepperBar";
import TipoSalaSelector from "@/components/salas/TipoSalaSelector";
import StepInformacion from "@/components/salas/StepInformacion";
import StepContenido from "@/components/salas/StepContenido";
import StepRolIA from "@/components/salas/StepRolIA";
import StepVistaPrevia from "@/components/salas/StepVistaPrevia";
import { SalaConfig, TipoSala, DEFAULT_SALA_CONFIG } from "@/components/salas/types";

// ═══════════════════════════════════════════════════════════════════════════
// WIZARD DE CREACIÓN DE SALA — Página contenedora
// ═══════════════════════════════════════════════════════════════════════════
// Flujo:  [tipo-selector] → step 0 → step 1 → step 2 → step 3 → (crear)

type WizardPhase = "tipo" | "steps";

export default function CrearSalaPage() {
  const router = useRouter();

  // ── Fase del wizard ──────────────────────────────────────────────────────
  const [phase, setPhase] = useState<WizardPhase>("tipo");
  const [currentStep, setCurrentStep] = useState<number>(0); // 0-indexed

  // ── Estado del formulario ────────────────────────────────────────────────
  const [config, setConfig] = useState<SalaConfig>(DEFAULT_SALA_CONFIG);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoSala | null>(null);

  // ── Estado de creación ───────────────────────────────────────────────────
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // ── Patch parcial de config ──────────────────────────────────────────────
  const handleChange = (patch: Partial<SalaConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
    setStepError(null);
  };

  // ── Avanzar a la fase de steps ───────────────────────────────────────────
  const handleTipoNext = () => {
    if (!tipoSeleccionado) return;
    handleChange({ tipo: tipoSeleccionado });
    setPhase("steps");
    setCurrentStep(0);
  };

  // ── Validaciones por paso ────────────────────────────────────────────────
  const validateCurrentStep = (): boolean => {
    if (currentStep === 0) {
      if (!config.nombre.trim()) {
        setStepError("El nombre de la sala es obligatorio.");
        return false;
      }
    }
    return true;
  };

  // ── Siguiente paso ───────────────────────────────────────────────────────
  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 3) {
      setCurrentStep((p) => p + 1);
      setStepError(null);
    }
  };

  // ── Paso anterior ────────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentStep === 0) {
      // Volver al selector de tipo
      setPhase("tipo");
      setStepError(null);
    } else {
      setCurrentStep((p) => p - 1);
      setStepError(null);
    }
  };

  // ── Crear sala (submit final) ────────────────────────────────────────────
  const handleCrear = async () => {
    setIsCreating(true);
    try {
      // TODO: conectar con endpoint /api/v1/salas/create y enviar `config`
      // const token = localStorage.getItem("token");
      // await fetch(`${BACKEND_URL}/api/v1/salas/create`, { method: "POST", ... })
      await new Promise((res) => setTimeout(res, 2500)); // simulación
      router.push("/dashboard/salas?sala_creada=1");
    } catch {
      setStepError("Ocurrió un error al crear la sala. Inténtalo nuevamente.");
      setIsCreating(false);
    }
  };

  // ── Título dinámico por paso ─────────────────────────────────────────────
  const STEP_TITLES = [
    "Información básica",
    "Origen del contenido",
    "Rol de la IA",
    "Vista previa",
  ];

  const isLastStep = currentStep === 3;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      {/* ── Cabecera de flujo ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            phase === "tipo" ? router.push("/dashboard/salas") : handleBack()
          }
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shrink-0"
          aria-label="Volver"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-headings font-black text-xl text-slate-900 tracking-tight leading-none">
            Crear Sala
          </h1>
          {phase === "steps" && (
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              {STEP_TITLES[currentStep]} — Paso {currentStep + 1} de 4
            </p>
          )}
        </div>
      </div>

      {/* ── Fase: Selector de tipo ── */}
      {phase === "tipo" && (
        <TipoSalaSelector
          selected={tipoSeleccionado}
          onSelect={(t) => setTipoSeleccionado(t)}
          onNext={handleTipoNext}
        />
      )}

      {/* ── Fase: Wizard de pasos ── */}
      {phase === "steps" && (
        <div className="bg-white border border-[#E8EDF3] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">

          {/* Stepper */}
          <div className="px-8 pt-7 pb-5 border-b border-slate-100">
            <StepperBar currentStep={currentStep} />
          </div>

          {/* Cuerpo del paso activo */}
          <div className="px-8 py-7">
            {currentStep === 0 && (
              <StepInformacion
                config={config}
                onChange={handleChange}
                error={stepError}
              />
            )}
            {currentStep === 1 && (
              <StepContenido config={config} onChange={handleChange} />
            )}
            {currentStep === 2 && (
              <StepRolIA config={config} onChange={handleChange} />
            )}
            {currentStep === 3 && (
              <StepVistaPrevia config={config} isCreating={isCreating} />
            )}
          </div>

          {/* Barra de navegación inferior */}
          <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 bg-slate-50/20">
            {/* Botón regresar */}
            <button
              type="button"
              onClick={handleBack}
              disabled={isCreating}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Regresar
            </button>

            {/* Botón siguiente / crear */}
            {isLastStep ? (
              <button
                type="button"
                onClick={handleCrear}
                disabled={isCreating}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#FF7657] hover:bg-[#e86646] text-white text-xs font-black transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.97] shadow-[0_4px_12px_rgba(255,118,87,0.2)] hover:shadow-[0_6px_16px_rgba(255,118,87,0.3)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Creando sala...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Crear Sala
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-7 py-2.5 rounded-xl bg-morado-ia hover:bg-[#6b5ae0] text-white text-xs font-black transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.97] shadow-[0_4px_12px_rgba(124,108,242,0.2)] hover:shadow-[0_6px_16px_rgba(124,108,242,0.3)] cursor-pointer"
              >
                Siguiente
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
