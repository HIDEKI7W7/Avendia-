"use client";

import React from "react";
import { Check } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// STEPPER HORIZONTAL REUTILIZABLE
// ═══════════════════════════════════════════════════════════════════════════

interface StepMeta {
  label: string;
}

const STEPS: StepMeta[] = [
  { label: "Información" },
  { label: "Contenido" },
  { label: "Rol de la IA" },
  { label: "Vista previa" },
];

interface StepperBarProps {
  /** 0-indexed paso activo (0 = Información, 3 = Vista previa) */
  currentStep: number;
}

export default function StepperBar({ currentStep }: StepperBarProps) {
  return (
    <div className="w-full flex items-center gap-0" role="progressbar" aria-label="Progreso del formulario">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        const isLast = idx === STEPS.length - 1;

        return (
          <React.Fragment key={step.label}>
            {/* Nodo del paso */}
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              {/* Círculo */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-headings font-black text-sm transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : isActive
                    ? "bg-[#7C6CF2] text-white shadow-[0_4px_12px_rgba(124,108,242,0.3)] ring-4 ring-[#7C6CF2]/25"
                    : "bg-slate-50 text-slate-400 border border-slate-200/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Etiqueta */}
              <span
                className={`text-[10px] font-bold whitespace-nowrap transition-colors duration-200 ${
                  isCompleted
                    ? "text-emerald-600"
                    : isActive
                    ? "text-[#7C6CF2]"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Conector — entre pasos, excepto el último */}
            {!isLast && (
              <div className="flex-1 h-0.5 mx-2 mt-[-14px] relative">
                {/* Base gris */}
                <div className="absolute inset-0 bg-slate-200 rounded-full" />
                {/* Relleno de progreso */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    idx < currentStep ? "w-full bg-emerald-400" : "w-0"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
