"use client";

import React from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col items-center p-8 text-center animate-scaleUp">
        
        {/* Top Progress bar (glowing gradient/coral/purple) */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#7C6CF2] via-[#F43F5E] to-[#4A90E2]" />

        {/* Decorative graphic / Premium SVG Icon representing welcoming learning */}
        <div className="w-24 h-24 rounded-full bg-violet-50 flex items-center justify-center mb-6 mt-2 relative">
          {/* Subtle glowing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-violet-100 animate-ping opacity-25" />
          <span className="text-5xl">✨</span>
        </div>

        {/* Headline */}
        <h2 className="font-headings font-bold text-2xl text-slate-900 leading-tight mb-3">
          ¡Bienvenido a AVENDIA!
        </h2>

        {/* Highlighted Subtitle */}
        <div className="px-5 py-2.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 font-body font-bold text-sm mb-6 inline-flex items-center gap-2">
          <span>🪙</span>
          <span>¡Empiezas con 7 créditos gratuitos!</span>
        </div>

        {/* Bullet description of the platform benefits */}
        <p className="font-body text-xs text-slate-500 leading-relaxed mb-8 max-w-sm">
          Planifica en cascada, alinea tus competencias al CNEB 2026 y genera tus sesiones y unidades de aprendizaje en formato Word listos para descargar. ¡Que disfrutes tu tiempo libre!
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-[#7C6CF2] hover:bg-[#6858e0] text-white font-headings font-bold text-sm shadow-lg shadow-[#7C6CF2]/20 hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          ¡Comenzar!
        </button>
      </div>
    </div>
  );
}
