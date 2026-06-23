"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { onboardingSchema, OnboardingFormValues } from "./types";
import {
  StepBienvenida,
  StepOrigen,
  StepAula,
  StepCurriculo,
  StepSaberes,
} from "./StepViews";
import GenerationLoading from "./GenerationLoading";

interface OnboardingWizardProps {
  onFinish?: (data: OnboardingFormValues) => void;
}

export default function OnboardingWizard({ onFinish }: OnboardingWizardProps) {
  // ─── 1. Estado de Pasos ──────────────────────────────────────────────────
  // 1: Bienvenida, 2: Origen, 3: Aula, 4: Currículo, 5: Saberes, 6: Carga/Procesando
  const [step, setStep] = useState<number>(1);

  // ─── 2. React Hook Form ──────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      source: "",
      classroomName: "",
      studentsDescription: "",
      educationLevel: "",
      grades: [],
      term: "",
      knowledgeFields: [],
      knowledgeAreas: [],
      baseContents: {},
    },
    mode: "onChange",
  });

  // ─── 3. Acciones de Navegación ───────────────────────────────────────────
  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => prev + 1);
    } else {
      // Si estamos en paso 5, enviamos el formulario
      setStep(6); // Transición a pantalla de carga/procesamiento
      handleSubmit(
        (data) => {
          console.log("[OnboardingWizard] Formulario completado con éxito:", data);
          if (onFinish) {
            onFinish(data);
          }
        },
        (err) => {
          console.error("[OnboardingWizard] Error de validación del formulario:", err);
          // Si hay errores, regresamos al paso correspondiente (por seguridad)
          setStep(5);
        }
      )();
    }
  };

  const handleBack = () => {
    if (step > 1 && step <= 5) {
      setStep((prev) => prev - 1);
    }
  };

  // Cálculo de la barra de progreso (solo se muestra en pasos 1 a 5)
  const progressPct = step <= 5 ? (step / 5) * 100 : 100;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6 relative overflow-hidden font-body text-slate-800">
      {/* Glow decorativo de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#7C6CF2]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#FF7675]/5 blur-3xl pointer-events-none" />

      {step === 6 ? (
        // Pantalla de Carga y Procesamiento
        <GenerationLoading
          onComplete={() => {
            // Callback al terminar la simulación
            console.log("[OnboardingWizard] Procesamiento de IA completado.");
            window.location.href = "/dashboard"; // Redirigir al inicio del dashboard
          }}
        />
      ) : (
        // Contenedor del Asistente (Pasos 1 al 5)
        <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 z-10 flex flex-col gap-6 relative">
          
          {/* Fila Superior: Botón Volver (←) y Progreso Numérico */}
          <div className="flex items-center justify-between min-h-[32px] border-b border-slate-100 pb-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                title="Volver al paso anterior"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
            ) : (
              <div className="w-10" />
            )}

            {/* Avance Numérico */}
            <span className="text-[10px] font-bold text-[#FF7675] uppercase tracking-widest bg-[#FF7675]/8 px-3 py-1 rounded-full">
              Paso {step} de 5
            </span>
          </div>

          {/* Barra de Progreso Superior Coral */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative -mt-3">
            <div
              className="h-full bg-[#FF7675] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Vistas de cada Paso */}
          <div className="flex-1 mt-2">
            {step === 1 && <StepBienvenida onNext={handleNext} />}
            {step === 2 && (
              <StepOrigen
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                onNext={handleNext}
              />
            )}
            {step === 3 && (
              <StepAula
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                onNext={handleNext}
              />
            )}
            {step === 4 && (
              <StepCurriculo
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                onNext={handleNext}
              />
            )}
            {step === 5 && (
              <StepSaberes
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                onNext={handleNext}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
