"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"mensual" | "anual">("anual");
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState("");

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim()) {
      setEmailSubscribed(true);
      setTimeout(() => {
        setEmailSubscribed(false);
        setSubscribedEmail("");
      }, 4000);
    }
  };

  const handleCleanLogin = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== "undefined") {
      // Limpiar localstorage y sessionstorage
      localStorage.clear();
      sessionStorage.clear();

      // Limpiar cookies
      document.cookie = "avendia_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "avendia_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "avendia_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Redirigir limpiamente
      window.location.href = "/login";
    }
  };

  const faqs = [
    {
      q: "¿AVENDIA se adapta estrictamente al currículo del MINEDU y el CNEB?",
      a: "Sí, absolutamente. AVENDIA fue diseñado específicamente para la educación peruana. Nuestro motor RAG (Generación Aumentada por Recuperación) busca y extrae información en tiempo real de las bases de datos del Currículo Nacional de Educación Básica (CNEB) del MINEDU. Todas las competencias, capacidades y desempeños sugeridos corresponden exactamente a los programas oficiales de Inicial, Primaria y Secundaria."
    },
    {
      q: "¿Puedo realizar mis pagos a través de Yape o Plin?",
      a: "Sí, admitimos todos los medios de pago locales preferidos por los docentes peruanos. Puedes pagar al instante escaneando nuestros códigos QR oficiales de Yape y Plin, o utilizar tarjetas de débito/crédito nacionales y extranjeras (Visa, Mastercard, AMEX). Una vez realizado el pago, tus créditos se activan de inmediato."
    },
    {
      q: "¿Existe alguna garantía si el sistema no cumple mis expectativas?",
      a: "Queremos que planifiques con total tranquilidad. Si por alguna razón sientes que los documentos generados no se ajustan a tu práctica pedagógica, puedes solicitar un reembolso del 100% de tu dinero dentro de los primeros 7 días posteriores a tu compra, sin preguntas. Tu satisfacción es nuestra prioridad."
    },
    {
      q: "¿Necesito tener conocimientos avanzados de tecnología para usar la plataforma?",
      a: "Para nada. AVENDIA está pensado para ser tan intuitivo como enviar un mensaje de texto. Su interfaz en formato asistente (paso a paso) te guía rellenando opciones simples, calendarios interactivos y casillas de selección. En 15 minutos obtendrás un archivo Word profesional listo para presentar."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] font-body text-slate-800 flex flex-col selection:bg-[#7C6CF2]/20 selection:text-[#7C6CF2]">
      
      {/* ==========================================
          NAVBAR SUPERIOR
          ========================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAFBFC]/80 border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C6CF2] to-[#5C4EE0] flex items-center justify-center shadow-lg shadow-[#7C6CF2]/30">
              <span className="text-white font-headings font-bold text-xl">A</span>
            </div>
            <span className="font-headings font-bold text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              AVENDIA
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#beneficios" className="text-sm font-semibold text-slate-600 hover:text-[#7C6CF2] transition-colors">
              Beneficios
            </a>
            <a href="#planes" className="text-sm font-semibold text-slate-600 hover:text-[#7C6CF2] transition-colors">
              Planes y Precios
            </a>
            <a href="#preguntas" className="text-sm font-semibold text-slate-600 hover:text-[#7C6CF2] transition-colors">
              Preguntas Frecuentes
            </a>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              onClick={handleCleanLogin}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Ya tengo cuenta
            </Link>
            <Link 
              href="/login" 
              onClick={handleCleanLogin}
              className="px-5 py-2.5 rounded-full bg-[#7C6CF2] text-white font-semibold text-sm hover:bg-[#6858e0] shadow-md hover:shadow-lg hover:shadow-[#7C6CF2]/20 transition-all cursor-pointer"
            >
              Iniciar Sesión →
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 border-b border-slate-100 bg-[#FAFBFC] shadow-inner transition-all animate-fadeIn">
            <div className="flex flex-col gap-4">
              <a 
                href="#beneficios" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-600 hover:text-[#7C6CF2]"
              >
                Beneficios
              </a>
              <a 
                href="#planes" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-600 hover:text-[#7C6CF2]"
              >
                Planes y Precios
              </a>
              <a 
                href="#preguntas" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-600 hover:text-[#7C6CF2]"
              >
                Preguntas Frecuentes
              </a>
              <hr className="border-slate-100 my-1" />
              <Link 
                href="/login"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleCleanLogin(e);
                }}
                className="text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Ya tengo cuenta
              </Link>
              <Link 
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-[#7C6CF2] text-white text-sm font-semibold hover:bg-[#6858e0] transition-colors"
              >
                Registrarme Gratis →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ==========================================
          SECCIÓN 1: HERO IMPACTANTE Y CAPTACIÓN
          ========================================== */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-[#FAFBFC] via-white to-slate-50">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#7C6CF2]/15 to-[#4A90E2]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-gradient-to-br from-[#7DD3FC]/10 to-[#7C6CF2]/15 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Headline & CTA */}
            <div className="lg:col-span-6 flex flex-col text-center lg:text-left">
              <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C6CF2]/10 border border-[#7C6CF2]/20 text-[#7C6CF2] text-xs font-semibold tracking-wide uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C6CF2] animate-pulse" />
                Planificación curricular inteligente
              </div>

              <h1 className="font-headings font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-[1.1] tracking-tight mb-6">
                Eleva tu enseñanza. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#7C6CF2] via-[#5C4EE0] to-[#4A90E2] bg-clip-text text-transparent">
                  Diseños pedagógicos
                </span>{" "}
                adaptados al currículum en minutos.
              </h1>

              <p className="font-body text-slate-600 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Planifica en cascada con Inteligencia Artificial RAG. Genera unidades, planes anuales y sesiones alineados al CNEB 2026. Recupera tus fines de semana y disfruta de tu vocación.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto text-center px-8 py-4 rounded-2xl bg-[#7C6CF2] text-white font-bold text-base shadow-xl shadow-[#7C6CF2]/30 hover:shadow-2xl hover:bg-[#6858e0] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  ¡Regístrate Gratis!
                </Link>
                <Link 
                  href="/login" 
                  onClick={handleCleanLogin}
                  className="w-full sm:w-auto text-center px-8 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-base hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Ya tengo cuenta →
                </Link>
              </div>

              {/* Stats / Trust Badges */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-headings font-bold text-[#7C6CF2]">15 min</div>
                  <div className="text-xs text-slate-500 font-semibold uppercase mt-1">Tiempo de planificación</div>
                </div>
                <div>
                  <div className="text-2xl font-headings font-bold text-[#7C6CF2]">+20 hrs</div>
                  <div className="text-xs text-slate-500 font-semibold uppercase mt-1">Ahorradas por semana</div>
                </div>
                <div>
                  <div className="text-2xl font-headings font-bold text-[#7C6CF2]">100%</div>
                  <div className="text-xs text-slate-500 font-semibold uppercase mt-1">MINEDU / CNEB 2026</div>
                </div>
              </div>
            </div>

            {/* Right Column: Premium App Mockup */}
            <div className="lg:col-span-6 w-full flex justify-center">
              <div className="relative w-full max-w-2xl group">
                {/* Glowing Aura behind mockup */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#7C6CF2] via-[#4A90E2] to-[#7DD3FC] opacity-30 blur-2xl group-hover:opacity-40 transition-opacity duration-500" />
                
                {/* Dashboard Outer Box */}
                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                  {/* Window Title Bar */}
                  <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#EF4444] opacity-80" />
                      <span className="w-3 h-3 rounded-full bg-[#F59E0B] opacity-80" />
                      <span className="w-3 h-3 rounded-full bg-[#10B981] opacity-80" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">AVENDIA - Panel del Docente</span>
                    <div className="w-12" />
                  </div>

                  {/* Application Main Layout Simulation */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Mock Sidebar */}
                    <div className="w-20 sm:w-44 bg-slate-900 text-slate-400 p-3 flex flex-col gap-2 shrink-0 border-r border-slate-800">
                      <div className="flex items-center gap-2 px-1 py-2 border-b border-slate-800 mb-3">
                        <span className="w-5 h-5 rounded bg-[#7C6CF2] block shrink-0" />
                        <span className="text-[10px] font-bold text-white uppercase hidden sm:block">Planificador</span>
                      </div>
                      <div className="h-6 rounded bg-[#7C6CF2]/20 text-[#7C6CF2] flex items-center gap-2 px-2 text-[10px] sm:text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#7C6CF2]" />
                        <span className="hidden sm:block">Plan Anual</span>
                      </div>
                      <div className="h-6 rounded hover:bg-slate-800 flex items-center gap-2 px-2 text-[10px] sm:text-xs">
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                        <span className="hidden sm:block">Unidades</span>
                      </div>
                      <div className="h-6 rounded hover:bg-slate-800 flex items-center gap-2 px-2 text-[10px] sm:text-xs">
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                        <span className="hidden sm:block">Sesiones</span>
                      </div>
                      <div className="h-6 rounded hover:bg-slate-800 flex items-center gap-2 px-2 text-[10px] sm:text-xs">
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                        <span className="hidden sm:block">EduAsesor Bot</span>
                      </div>
                    </div>

                    {/* Mock Main Panel */}
                    <div className="flex-1 bg-[#FAFBFC] p-4 flex flex-col gap-3 overflow-y-auto">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-[#7C6CF2] uppercase">Paso 3 de 4</span>
                          <span className="text-sm font-headings font-bold text-slate-800">Constructor de Competencias CNEB</span>
                        </div>
                        <span className="text-[10px] bg-[#34D399]/20 text-[#059669] px-2 py-0.5 rounded font-bold">Matemática - 3ro Secundaria</span>
                      </div>

                      {/* Mock Interactive Selection */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5 shadow-sm">
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 bg-[#7C6CF2] text-white text-[10px] font-bold rounded flex items-center justify-center shrink-0">C1</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 leading-none">Resuelve problemas de cantidad</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">Capacidades y desempeños priorizados</span>
                          </div>
                        </div>

                        {/* Capacidades checkboxes */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="border border-slate-100 rounded-lg p-1.5 flex items-center gap-2 bg-[#FAFBFC]">
                            <span className="w-3.5 h-3.5 border border-[#7C6CF2] rounded bg-[#7C6CF2] flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="text-[8px] font-semibold text-slate-600 truncate">Traduce cantidades...</span>
                          </div>
                          <div className="border border-slate-100 rounded-lg p-1.5 flex items-center gap-2 bg-[#FAFBFC]">
                            <span className="w-3.5 h-3.5 border border-[#7C6CF2] rounded bg-[#7C6CF2] flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="text-[8px] font-semibold text-slate-600 truncate">Usa estrategias...</span>
                          </div>
                        </div>

                        {/* Desempeño Seleccionado */}
                        <div className="border-t border-slate-100 pt-2 flex flex-col gap-1.5">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Desempeños priorizados:</span>
                          <div className="bg-[#7C6CF2]/5 border border-[#7C6CF2]/10 rounded-lg p-2 flex items-start gap-2">
                            <span className="text-xs text-[#7C6CF2] shrink-0 mt-0.5">⚡</span>
                            <span className="text-[9px] text-[#5C4EE0] leading-relaxed">
                              Establece relaciones entre datos y acciones de comparar, igualar e incorporar cantidades, y las transforma a expresiones numéricas.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Chat assistant bubble overlay simulation */}
                      <div className="relative mt-1 bg-slate-900 rounded-xl p-3 flex gap-2.5 shadow-lg max-w-[85%] self-end border border-slate-800">
                        <span className="w-6 h-6 rounded-full bg-[#7C6CF2] flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow shadow-[#7C6CF2]/30">IA</span>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-slate-300">EduAsesor AI</span>
                          <span className="text-[10px] text-white leading-normal">
                            ¡Hecho! Tu sesión anual de aprendizaje en formato Word (.docx) está lista para exportar. Todos los bimestres están sincronizados.
                          </span>
                          <div className="flex gap-2 mt-1.5">
                            <span className="px-2 py-1 bg-[#7C6CF2] hover:bg-[#6858e0] text-white text-[8px] font-bold rounded cursor-pointer transition-all flex items-center gap-1">
                              📥 Descargar Word (.docx)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN 2: MATRIZ DE DOLOR VS BENEFICIO
          ========================================== */}
      <section id="beneficios" className="py-20 lg:py-28 bg-[#0F172A] text-white relative overflow-hidden">
        {/* Abstract background grids */}
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
            <span className="text-xs font-bold text-[#7C6CF2] tracking-widest uppercase bg-[#7C6CF2]/10 border border-[#7C6CF2]/20 px-3.5 py-1.5 rounded-full">
              Comparativa de impacto
            </span>
            <h2 className="font-headings font-bold text-3xl sm:text-4xl lg:text-5xl mt-6 mb-4">
              ¿Cómo es tu domingo actual?
            </h2>
            <p className="font-body text-slate-400 text-lg sm:text-xl">
              Recuperas hasta <span className="text-white font-bold underline decoration-[#7C6CF2] decoration-2">30 días al año</span> (240 horas que vuelven a tu vida).
            </p>
          </div>

          {/* Matrix Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto mb-20">
            {/* Column A: Without AVENDIA */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm p-6 sm:p-10 flex flex-col shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-xl">
                  ✗
                </div>
                <div>
                  <h3 className="font-headings font-bold text-xl text-slate-100">Sin AVENDIA</h3>
                  <span className="text-xs text-slate-500">Planificación Tradicional Manual</span>
                </div>
              </div>

              <ul className="flex flex-col gap-5 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                  <span>**Horas buscando manuales**: Pierdes domingos enteros cruzando el currículo CNEB y buscando los desempeños exactos por grado.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                  <span>**Copiar y pegar infinito**: Formatear plantillas de Word una y otra vez de manera inconsistente para cada sesión de clase.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                  <span>**Sin justificación adaptada**: Dificultad para formular los contextos de la realidad local de tus estudiantes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                  <span>**Fatiga burocrática y estrés**: Agotamiento mental los fines de semana, restándole energía a tu verdadera labor en el aula.</span>
                </li>
              </ul>
            </div>

            {/* Column B: With AVENDIA */}
            <div className="rounded-3xl border border-[#7C6CF2]/30 bg-gradient-to-b from-[#7C6CF2]/10 to-transparent backdrop-blur-sm p-6 sm:p-10 flex flex-col shadow-2xl relative">
              <div className="absolute top-4 right-4 bg-[#7C6CF2] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Recomendado
              </div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="font-headings font-bold text-xl text-slate-100">Con AVENDIA</h3>
                  <span className="text-xs text-[#7C6CF2] font-semibold">Generador Inteligente de Planes</span>
                </div>
              </div>

              <ul className="flex flex-col gap-5 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>**CNEB mapeado al 100%**: Selecciona con clics competencias, capacidades y desempeños precisos con auto-completados inteligentes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>**Generación en cascada**: En 15 minutos tu Plan Anual, unidades y sesiones se diseñan coherentemente con IA.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>**Descarga masiva en Word**: Exportación limpia de archivos `.docx` totalmente listos para su firma y presentación administrativa.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>**Domingos de descanso**: Recuperas tu tiempo libre para disfrutarlo en familia o recargar energías.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Lower Grid: 3 Clean Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Perdida tradicional</span>
              <h4 className="text-3xl font-headings font-bold text-red-400 mt-2">8-10 hrs</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">Dedicadas de media cada fin de semana solo a redactar planes y fichas.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Sacrificio anual</span>
              <h4 className="text-3xl font-headings font-bold text-red-400 mt-2">40 domingos</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">Al año planificando de manera manual y repetitiva.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-[#7C6CF2]/15 to-transparent border border-[#7C6CF2]/20 text-center">
              <span className="text-[#7C6CF2] text-xs font-bold uppercase tracking-wider">La gran pregunta</span>
              <h4 className="text-2xl font-headings font-bold text-white mt-2">¿Cuándo disfrutaste?</h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">¿Por última vez de tu vocación docente sin preocuparte de la burocracia escolar?</p>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          SECCIÓN 3: MATRIZ DE PRECIOS Y PASARELA LOCAL
          ========================================== */}
      <section id="planes" className="py-20 lg:py-28 bg-[#FAFBFC] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#7C6CF2] tracking-widest uppercase bg-[#7C6CF2]/10 border border-[#7C6CF2]/20 px-3.5 py-1.5 rounded-full">
              Inversión en tu bienestar
            </span>
            <h2 className="font-headings font-bold text-3xl sm:text-4xl lg:text-5xl mt-6 mb-4">
              Desbloquea tus Superpoderes Pedagógicos
            </h2>
            <p className="font-body text-slate-600 text-base sm:text-lg">
              Elige el plan ideal para automatizar tu diseño pedagógico y recuperar tu tiempo libre.
            </p>

            {/* Toggle Billing (Visual Only) */}
            <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-2xl bg-slate-100 border border-slate-200">
              <button 
                onClick={() => setBillingPeriod("mensual")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${billingPeriod === "mensual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Mensual
              </button>
              <button 
                onClick={() => setBillingPeriod("anual")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${billingPeriod === "anual" ? "bg-[#7C6CF2] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Anual
                <span className="bg-emerald-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md scale-95 shrink-0">
                  Ahorra 45%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Plan 1: Basic / Free */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 shadow-sm">
              <div>
                <div className="mb-4">
                  <h3 className="font-headings font-bold text-xl text-slate-800">Plan Inicial</h3>
                  <span className="text-xs text-slate-400">Prueba la tecnología sin costo</span>
                </div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-headings font-bold text-slate-800">S/. 0</span>
                  <span className="text-slate-400 text-xs">/ para siempre</span>
                </div>
                <hr className="border-slate-100 my-4" />
                <ul className="flex flex-col gap-3.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>3 créditos mensuales gratuitos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Acceso al catálogo CNEB 2026</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span className="text-slate-400">Sin descarga masiva en Word (.docx)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span className="text-slate-400">Asistente de IA limitado en contexto</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span className="text-slate-400">Contiene marca de agua en reportes</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link 
                  href="/register" 
                  className="block text-center w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Registrarse Gratis
                </Link>
              </div>
            </div>

            {/* Plan 2: Mensual */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 shadow-md relative">
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                Descuento -40%
              </div>
              <div>
                <div className="mb-4">
                  <h3 className="font-headings font-bold text-xl text-slate-800">Plan Mensual</h3>
                  <span className="text-xs text-slate-400">Libertad total mes a mes</span>
                </div>
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 line-through">S/. 24.90</span>
                    <span className="text-xs text-emerald-500 font-bold">Precio especial</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-headings font-bold text-slate-800">S/. 14.90</span>
                    <span className="text-slate-400 text-xs">/ mes</span>
                  </div>
                </div>
                <hr className="border-slate-100 my-4" />
                <ul className="flex flex-col gap-3.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>**Créditos ilimitados** de generación</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>Descarga de documentos en Word (.docx)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>Planificación en cascada conectada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>Exportaciones sin marca de agua</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>Soporte prioritario por WhatsApp</span>
                  </li>
                </ul>

                {/* Local Payment Badges */}
                <div className="mt-6 p-3 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-2 text-center">Paga fácil localmente con:</span>
                  <div className="flex items-center justify-center gap-4">
                    {/* Yape Mock Badge */}
                    <div className="flex items-center gap-1 bg-[#10B981]/10 px-2 py-1 rounded-lg border border-[#10B981]/20">
                      <span className="text-[10px] font-bold text-[#0D9488]">Yape</span>
                    </div>
                    {/* Plin Mock Badge */}
                    <div className="flex items-center gap-1 bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20">
                      <span className="text-[10px] font-bold text-sky-600">Plin</span>
                    </div>
                    {/* Cards */}
                    <div className="flex items-center gap-1 bg-slate-500/10 px-2 py-1 rounded-lg border border-slate-500/20">
                      <span className="text-[9px] font-bold text-slate-600">Tarjetas</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link 
                  href="/login" 
                  onClick={handleCleanLogin}
                  className="block text-center w-full py-3.5 rounded-2xl bg-[#7C6CF2] hover:bg-[#6858e0] text-white font-bold text-xs transition-colors shadow-lg shadow-[#7C6CF2]/15 hover:shadow-xl cursor-pointer"
                >
                  ¡Clic acá para empezar!
                </Link>
              </div>
            </div>

            {/* Plan 3: Anual (Recomendado/Destacado) */}
            <div className="bg-slate-900 border-2 border-[#7C6CF2] rounded-3xl p-8 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 shadow-2xl relative text-white">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7C6CF2] text-white text-[9px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-[#7C6CF2]/30">
                MEJOR PRECIO (AHORRA 45%)
              </div>
              <div>
                <div className="mb-4 mt-2">
                  <h3 className="font-headings font-bold text-xl text-white">Plan Anual Integral</h3>
                  <span className="text-xs text-slate-400">Planifica todo el año sin límites</span>
                </div>
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 line-through">S/. 178.80</span>
                    <span className="text-xs text-[#7C6CF2] font-bold">Un solo pago al año</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-headings font-bold text-white">S/. 99.00</span>
                    <span className="text-slate-400 text-xs">/ año</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Equivale a solo S/. 8.25 mensuales</span>
                </div>
                <hr className="border-slate-800 my-4" />
                <ul className="flex flex-col gap-3.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>**Acceso total ilimitado** todo el año</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>Descargas Word (.docx) inmediatas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>Coherencia curricular garantizada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>Acceso garantizado a actualizaciones de IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#7C6CF2] font-bold">✓</span>
                    <span>Soporte VIP por WhatsApp y teléfono</span>
                  </li>
                </ul>

                {/* Local Payment Badges */}
                <div className="mt-6 p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-2 text-center">Paga fácil localmente con:</span>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1 bg-[#10B981]/20 px-2 py-1 rounded-lg border border-[#10B981]/30">
                      <span className="text-[10px] font-bold text-emerald-400">Yape</span>
                    </div>
                    <div className="flex items-center gap-1 bg-sky-500/20 px-2 py-1 rounded-lg border border-sky-500/30">
                      <span className="text-[10px] font-bold text-sky-400">Plin</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-500/20 px-2 py-1 rounded-lg border border-slate-500/30">
                      <span className="text-[9px] font-bold text-slate-300">Tarjetas</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link 
                  href="/login" 
                  onClick={handleCleanLogin}
                  className="block text-center w-full py-3.5 rounded-2xl bg-[#7C6CF2] hover:bg-[#6858e0] text-white font-bold text-xs transition-all shadow-lg shadow-[#7C6CF2]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  ¡Asegurar mis domingos!
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN 4: ACORDEÓN DE PREGUNTAS FRECUENTES
          ========================================== */}
      <section id="preguntas" className="py-20 lg:py-28 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#7C6CF2] tracking-widest uppercase bg-[#7C6CF2]/10 border border-[#7C6CF2]/20 px-3.5 py-1.5 rounded-full">
              Resolvemos tus dudas
            </span>
            <h2 className="font-headings font-bold text-3xl sm:text-4xl mt-6 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="font-body text-slate-500 text-sm sm:text-base">
              Si tienes alguna otra duda pedagógica, no dudes en escribirnos directamente.
            </p>
          </div>

          {/* Accordion List */}
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? "border-[#7C6CF2] bg-[#7C6CF2]/5" : "border-slate-200 bg-white"}`}
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-semibold text-slate-800 hover:text-slate-900 transition-colors focus:outline-none cursor-pointer"
                  >
                    <span className="font-headings text-sm sm:text-base">{faq.q}</span>
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "border-[#7C6CF2] bg-[#7C6CF2] text-white rotate-45" : "border-slate-300 text-slate-500"}`}>
                      +
                    </span>
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[300px] border-t border-slate-100" : "max-h-0 pointer-events-none"}`}
                  >
                    <div className="p-5 sm:p-6 text-slate-600 text-xs sm:text-sm leading-relaxed font-body">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ==========================================
          SECCIÓN 5: PIE DE PÁGINA Y CONFIANZA CORPORATIVA
          ========================================== */}
      <section className="bg-slate-900 text-white pt-16 pb-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Newsletter Box */}
          <div className="bg-slate-800/50 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
            <div className="max-w-md">
              <h3 className="font-headings font-bold text-lg sm:text-xl mb-2">
                Ideas para planificar con IA, directo a tu correo. Gratis.
              </h3>
              <p className="font-body text-slate-400 text-xs sm:text-sm leading-normal">
                Únete a más de 5,000 docentes peruanos que reciben consejos pedagógicos e instructivos semanales.
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Escribe tu correo de docente" 
                value={subscribedEmail}
                onChange={(e) => setSubscribedEmail(e.target.value)}
                required
                className="w-full lg:w-80 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:outline-none focus:border-[#7C6CF2] text-sm text-slate-200 placeholder-slate-500 font-body"
              />
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#7C6CF2] hover:bg-[#6858e0] text-white font-bold text-sm transition-colors shrink-0 cursor-pointer"
              >
                Suscribirme
              </button>
            </form>

            {emailSubscribed && (
              <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-xl font-body font-bold text-xs flex items-center gap-2 animate-slideIn">
                <span>✓</span>
                ¡Suscripción exitosa! Revisa tu bandeja de entrada pronto.
              </div>
            )}
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 pb-12 border-b border-slate-800">
            {/* Corporate Info */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#7C6CF2] flex items-center justify-center">
                  <span className="text-white font-headings font-bold text-sm">A</span>
                </div>
                <span className="font-headings font-bold text-xl tracking-tight text-white">
                  AVENDIA
                </span>
              </div>
              <p className="font-body text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                Reduciendo la carga burocrática del magisterio peruano mediante tecnología de Inteligencia Artificial contextualizada. Facilitamos el diseño curricular para elevar el nivel del aula.
              </p>
            </div>

            {/* Navigation links */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navegación</span>
              <a href="#beneficios" className="text-xs text-slate-300 hover:text-white transition-colors">Beneficios</a>
              <a href="#planes" className="text-xs text-slate-300 hover:text-white transition-colors">Planes y Precios</a>
              <a href="#preguntas" className="text-xs text-slate-300 hover:text-white transition-colors">Preguntas Frecuentes</a>
            </div>

            {/* Legal */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legal</span>
              <Link href="/login" className="text-xs text-slate-300 hover:text-white transition-colors">Términos del Servicio</Link>
              <Link href="/login" className="text-xs text-slate-300 hover:text-white transition-colors">Política de Privacidad</Link>
              <Link href="/login" className="text-xs text-slate-300 hover:text-white transition-colors">Libro de Reclamaciones</Link>
            </div>

            {/* Support / Contact */}
            <div className="md:col-span-3 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contacto Directo</span>
              <a 
                href="https://wa.me/51999999999?text=Hola,%20necesito%20soporte%20con%20AVENDIA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {/* Whatsapp Icon */}
                <svg className="w-4 h-4 text-emerald-400 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.921 1.453 5.485.002 9.948-4.41 9.95-9.825.002-2.624-1.013-5.093-2.858-6.94-1.846-1.847-4.3-2.864-6.93-2.866-5.49 0-9.953 4.411-9.956 9.828-.001 1.838.497 3.633 1.442 5.175l-.99 3.613 3.733-.968z" />
                </svg>
                Soporte por WhatsApp
              </a>
              <span className="text-xs text-slate-500">Horario: Lun a Dom — 8:00 AM a 9:00 PM</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-body">
            <span>© 2026 AVENDIA. Todos los derechos reservados.</span>
            <span>Diseñado con pasión para los docentes peruanos.</span>
          </div>

        </div>
      </section>

    </div>
  );
}
