"use client";

import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { subscriptionPlans } from "./plansData";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Pequeño delay para permitir que la transición se active
      const timer = setTimeout(() => setAnimate(true), 50);
      document.body.style.overflow = "hidden";
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      
      {/* ── Overlay oscuro difuminado con animación de opacidad ── */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          animate ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── Contenedor del Modal con animación de escala/opacidad ── */}
      <div
        className={`relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 flex flex-col gap-6 z-10 overflow-y-auto max-h-[90vh] transition-all duration-300 ease-out border border-slate-100 ${
          animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        
        {/* Botón de cerrar X */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 active:scale-95 cursor-pointer"
          title="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="text-center max-w-xl mx-auto space-y-2 mt-4">
          <span className="text-[10px] font-extrabold bg-[#7C6CF2]/10 text-[#7C6CF2] px-3 py-1 rounded-full uppercase tracking-wider">
            👑 Suscripciones Premium
          </span>
          <h2 className="font-headings font-black text-2xl md:text-3xl text-slate-900 tracking-tight leading-tight">
            Lleva tu Planificación Curricular al Siguiente Nivel
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-body">
            Desbloquea créditos ilimitados con inteligencia artificial del Minedu, exporta a Word directo sin marcas de agua y optimiza tu tiempo escolar.
          </p>
        </div>

        {/* Grid de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mt-2">
          {subscriptionPlans.map((plan) => {
            const isPremium = plan.key === "premium";
            const isInstitucional = plan.key === "institucional";

            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl p-6 flex flex-col gap-6 transition-all duration-300 ${
                  isPremium
                    ? "bg-white border-2 border-[#FF7657] shadow-[0_12px_36px_rgba(255,118,87,0.18)] scale-[1.02] md:scale-[1.03]"
                    : "bg-white border border-[#E8EDF3] hover:border-slate-300 shadow-[0_4px_20px_rgba(30,41,59,0.02)]"
                }`}
              >
                {/* Badge de "Más Popular" */}
                {plan.isPopular && (
                  <span className="absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#FF7657] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md shadow-[#FF7657]/20">
                    Más Popular
                  </span>
                )}

                {/* Encabezado de la Tarjeta */}
                <div className="space-y-2">
                  <h4 className="font-headings font-bold text-lg text-slate-900 leading-tight">
                    {plan.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-body leading-normal min-h-[36px]">
                    {plan.description}
                  </p>
                </div>

                {/* Precio */}
                <div className="flex items-baseline gap-1 select-none">
                  {plan.price !== "Cotizar" ? (
                    <>
                      <span className="text-xl font-bold text-slate-500">{plan.currency}</span>
                      <span className="font-headings font-black text-4xl text-slate-900 tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/{plan.frequency}</span>
                    </>
                  ) : (
                    <span className="font-headings font-black text-3xl text-[#7C6CF2] tracking-tight">
                      Cotizar
                    </span>
                  )}
                </div>

                {/* Línea Divisoria */}
                <div className="w-full h-px bg-slate-100" />

                {/* Lista de características */}
                <div className="flex-1 flex flex-col gap-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ¿Qué incluye este plan?
                  </span>
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex gap-2.5 items-start text-xs font-semibold leading-relaxed text-slate-600">
                        <span className="p-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botón de Acción */}
                <button
                  type="button"
                  className={`w-full py-3.5 rounded-xl font-headings font-black text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    isPremium
                      ? "bg-[#FF7657] hover:bg-[#e66345] text-white shadow-md shadow-[#FF7657]/30 hover:shadow-lg hover:shadow-[#FF7657]/40"
                      : isInstitucional
                      ? "bg-[#7C6CF2] hover:bg-[#6858e0] text-white shadow-md shadow-[#7C6CF2]/30 hover:shadow-lg hover:shadow-[#7C6CF2]/40"
                      : "border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Pie de modal */}
        <div className="text-center text-[10px] text-slate-400 font-body mt-2">
          ¿Tienes dudas sobre los planes? Escríbenos a <span className="font-semibold text-[#7C6CF2] hover:underline cursor-pointer">soporte@avendia.edu</span> o consulta a EduAsesor.
        </div>
      </div>
    </div>
  );
}
