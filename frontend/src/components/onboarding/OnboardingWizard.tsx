"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Check, Compass, Sparkles, Orbit, BrainCircuit, HelpCircle } from "lucide-react";

interface OnboardingWizardProps {
  onFinish?: (data: any) => void;
}

export default function OnboardingWizard({ onFinish }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedEnfoque, setSelectedEnfoque] = useState<string | null>(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingTexts = [
    "Desafiando la gravedad...",
    "Alineando tus herramientas...",
    "Sincronizando el espacio RAG...",
    "Listo para flotar.",
  ];

  // Rotate loading text
  useEffect(() => {
    if (step !== 3) return;
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, [step]);

  // Complete onboarding after step 3 completes
  useEffect(() => {
    if (step === 3 && loadingTextIndex === loadingTexts.length - 1) {
      const timer = setTimeout(() => {
        const onboardingData = {
          name: name || "Docente",
          enfoque: selectedEnfoque || "Planificación General",
        };
        if (onFinish) {
          onFinish(onboardingData);
        }
        window.location.href = "/dashboard";
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, loadingTextIndex, name, selectedEnfoque, onFinish]);

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step === 2 && !selectedEnfoque) return;
    setStep((prev) => prev + 1);
  };

  const enfoques = [
    {
      id: "planificacion",
      title: "Planificación CNEB",
      desc: "Genera unidades de aprendizaje y planes anuales con base en el Currículo Nacional.",
      icon: <Compass className="w-6 h-6 text-[#7C6CF2]" />,
      badge: "Más Popular",
    },
    {
      id: "evaluacion",
      title: "Evaluación & Rúbricas",
      desc: "Elabora matrices de criterios, rúbricas y listas de cotejo de forma atómica.",
      icon: <BrainCircuit className="w-6 h-6 text-[#06B6D4]" />,
      badge: "Nueva IA",
    },
    {
      id: "tutoria",
      title: "Tutoría & Apoyo IA",
      desc: "Chatea con EduAsesor sobre normativa escolar, incidencias y fichas escolares.",
      icon: <HelpCircle className="w-6 h-6 text-[#FDA4AF]" />,
      badge: "Soporte",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black flex items-center justify-center p-6 relative overflow-hidden font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Decorative Floating Cosmic Glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[40rem] h-[40rem] rounded-full bg-[#7C6CF2]/5 dark:bg-[#7C6CF2]/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[45rem] h-[45rem] rounded-full bg-[#06B6D4]/5 dark:bg-[#06B6D4]/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />

      {/* Main Glassmorphic Onboarding Container */}
      <div className="w-full max-w-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-slate-800/40 rounded-[2.25rem] shadow-[0_20px_50px_rgba(124,108,242,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 sm:p-10 z-10 flex flex-col gap-8 relative transition-all duration-500 ease-out">
        
        {/* Step 1: Despegue Personalizado */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="text-center flex flex-col items-center gap-3">
              <span className="text-[9px] font-headings font-black text-[#7C6CF2] dark:text-[#9A8DFF] bg-[#7C6CF2]/8 dark:bg-[#7C6CF2]/20 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#7C6CF2] dark:text-[#9A8DFF] animate-spin" style={{ animationDuration: "3s" }} />
                Paso 1: Bienvenida
              </span>
              <h1 className="font-headings font-black text-2xl sm:text-3xl tracking-tight leading-tight bg-gradient-to-r from-[#7C6CF2] via-[#06B6D4] to-[#FDA4AF] bg-clip-text text-transparent">
                Bienvenido al espacio Antigravity.<br />Diseñemos tu órbita.
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-sm">
                Indícanos tu nombre de docente para personalizar los materiales curriculares creados por la IA.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-bold text-[#7C6CF2] dark:text-[#9A8DFF] uppercase tracking-wider pl-1">
                ¿Cómo te llamas?
              </label>
              <input
                type="text"
                placeholder="Escribe tu nombre completo..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 focus:outline-none focus:ring-4 focus:ring-[#7C6CF2]/15 focus:border-[#7C6CF2] text-sm text-slate-900 dark:text-white transition-all shadow-inner font-semibold placeholder:text-slate-400"
                required
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) handleNext();
                }}
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#7C6CF2] to-[#06B6D4] text-white font-headings font-black text-xs uppercase tracking-widest shadow-lg shadow-[#7C6CF2]/20 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Ingresar al Espacio</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Step 2: Selección de Enfoque */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="text-center flex flex-col items-center gap-3">
              <span className="text-[9px] font-headings font-black text-[#06B6D4] dark:text-cyan-300 bg-[#06B6D4]/8 dark:bg-[#06B6D4]/20 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                Paso 2: Enfoque Pedagógico
              </span>
              <h2 className="font-headings font-black text-xl sm:text-2xl tracking-tight leading-tight text-slate-900 dark:text-white">
                ¿Qué deseas lograr primero, {name.split(" ")[0]}?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Selecciona tu enfoque de trabajo prioritario. Podrás acceder a todas las opciones más tarde.
              </p>
            </div>

            {/* Asymmetrical Floating Grid */}
            <div className="flex flex-col gap-3.5 mt-2">
              {enfoques.map((enf) => {
                const isSelected = selectedEnfoque === enf.title;
                return (
                  <button
                    key={enf.id}
                    onClick={() => setSelectedEnfoque(enf.title)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none flex gap-4 items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-white/95 dark:bg-slate-900 border-[#7C6CF2] dark:border-[#7C6CF2] shadow-[0_8px_30px_rgba(124,108,242,0.1)]"
                        : "bg-white/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:border-[#7C6CF2]/40"
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className={`p-3 rounded-xl ${isSelected ? "bg-[#7C6CF2]/10" : "bg-slate-100 dark:bg-slate-800"}`}>
                        {enf.icon}
                      </div>
                      <div>
                        <h4 className="font-headings font-bold text-xs text-slate-850 dark:text-white uppercase tracking-wide">
                          {enf.title}
                        </h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed mt-0.5 max-w-sm">
                          {enf.desc}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#7C6CF2] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <span className="text-[7px] font-headings font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                        {enf.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedEnfoque}
              className="w-full mt-4 py-4 rounded-2xl bg-[#7C6CF2] hover:bg-[#6858E0] text-white font-headings font-black text-xs uppercase tracking-widest shadow-lg shadow-[#7C6CF2]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Generar Espacio</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Step 3: Sincronización Mágica */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-10 gap-6 animate-in fade-in zoom-in-95 duration-500 select-none">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Spinning orbital background */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#7C6CF2]/25 animate-spin" style={{ animationDuration: "12s" }} />
              
              {/* Inner glowing orbit */}
              <div className="absolute inset-2 rounded-full border border-[#06B6D4]/30 animate-pulse" />
              
              {/* Floating central icon */}
              <Orbit className="w-10 h-10 text-[#7C6CF2] animate-spin" style={{ animationDuration: "4s" }} />
            </div>

            <div className="text-center flex flex-col gap-2">
              <h3 className="font-headings font-black text-sm text-slate-850 dark:text-white uppercase tracking-widest animate-pulse">
                {loadingTexts[loadingTextIndex]}
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold max-w-xs">
                Alineando los módulos de ingravidez de Antigravity para {name}...
              </p>
            </div>

            {/* Orbit progress line */}
            <div className="w-36 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#7C6CF2] to-[#06B6D4] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((loadingTextIndex + 1) / loadingTexts.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
