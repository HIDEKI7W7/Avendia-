"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BACKEND_URL } from "@/config/api";
import WelcomeModal from "@/components/auth/WelcomeModal";
import { useUser } from "@/context/UserContext";
import {
  Search,
  Bell,
  Coins,
  ChevronLeft,
  ChevronRight,
  FileText,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Calendar,
  Book,
  ClipboardList,
  Users,
  Award,
  Sparkles,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════
interface PedagogicalModule {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorHex: string;
  hoverColorHex: string;
  bgColorOpacity: string;
  path: string;
}

const CAROUSEL_SLIDES = [
  {
    id: 1,
    badge: "🔥 OFERTA DEL AÑO",
    title: "Temporada de Planificación Curricular",
    description: "Genera unidades, planes anuales y sesiones de aprendizaje alineados al CNEB 2026 en minutos con RAG.",
    countdown: "¡Descuento del 45% en Plan Anual finaliza pronto!",
    buttonText: "¡Aprovéchala! →",
    bgColor: "from-[#7C6CF2] to-[#5B4DC4]",
    actionUrl: "#planes",
  },
  {
    id: 2,
    badge: "✨ NOVEDAD",
    title: "Evaluación Rápida por Competencias",
    description: "Crea rúbricas de evaluación detalladas y listas de cotejo de forma atómica y estructurada.",
    countdown: "Actualizado según directrices del MINEDU 2026",
    buttonText: "Crear Rúbrica →",
    bgColor: "from-[#4A90E2] to-[#7C6CF2]",
    actionUrl: "/dashboard/rubrica-evaluacion",
  },
  {
    id: 3,
    badge: "🤖 EDUASESOR IA",
    title: "Soporte Administrativo y Tutoría",
    description: "Resuelve consultas de normativas escolares, actas de consejo técnico o reportes de incidencias.",
    countdown: "Respuestas con base vectorial RAG en tiempo real",
    buttonText: "Chatear con IA →",
    bgColor: "from-[#1E293B] to-[#0F172A]",
    actionUrl: "chat-trigger",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
function DashboardPageContent() {
  const searchParams = useSearchParams();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const { user } = useUser();

  // Estados del Carousel
  const [currentSlide, setCurrentSlide] = useState(0);

  // Catálogo de Módulos Pedagógicos Oficiales de AVENDIA
  const modules: PedagogicalModule[] = [
    {
      number: 1,
      title: "PLAN ANUAL",
      description: "Crea tu planificación anual de forma estructurada alineada al CNEB.",
      icon: <Calendar className="w-6 h-6 text-[#7C6CF2]" />,
      colorHex: "#7C6CF2",
      hoverColorHex: "#6B5AE0",
      bgColorOpacity: "bg-[#7C6CF2]/10",
      path: "/dashboard/plan-anual",
    },
    {
      number: 2,
      title: "UNIDADES",
      description: "Diseña unidades de aprendizaje alineadas al currículo y competencias.",
      icon: <Book className="w-6 h-6 text-[#4A90E2]" />,
      colorHex: "#4A90E2",
      hoverColorHex: "#357ABD",
      bgColorOpacity: "bg-[#4A90E2]/10",
      path: "/dashboard/unidades",
    },
    {
      number: 3,
      title: "SESIONES",
      description: "Planifica sesiones de aprendizaje efectivas y significativas paso a paso.",
      icon: <FileText className="w-6 h-6 text-[#16A34A]" />,
      colorHex: "#16A34A",
      hoverColorHex: "#15803D",
      bgColorOpacity: "bg-[#16A34A]/10",
      path: "/dashboard/sesiones",
    },
    {
      number: 4,
      title: "FICHAS DE APRENDIZAJE",
      description: "Genera fichas y actividades de refuerzo listas para imprimir y aplicar.",
      icon: <BookOpen className="w-6 h-6 text-[#EA580C]" />,
      colorHex: "#EA580C",
      hoverColorHex: "#C2410C",
      bgColorOpacity: "bg-[#EA580C]/10",
      path: "/dashboard/fichas-aprendizaje",
    },
    {
      number: 5,
      title: "RÚBRICA DE EVALUACIÓN",
      description: "Crea rúbricas de evaluación claras y objetivas por competencias.",
      icon: <Award className="w-6 h-6 text-[#E11D48]" />,
      colorHex: "#E11D48",
      hoverColorHex: "#BE123C",
      bgColorOpacity: "bg-[#E11D48]/10",
      path: "/dashboard/rubrica-evaluacion",
    },
    {
      number: 6,
      title: "LISTA DE COTEJO",
      description: "Elabora listas de cotejo sencillas y escalas de valoración en segundos.",
      icon: <ClipboardList className="w-6 h-6 text-[#0D9488]" />,
      colorHex: "#0D9488",
      hoverColorHex: "#0F766E",
      bgColorOpacity: "bg-[#0D9488]/10",
      path: "/dashboard/lista-cotejo",
    },
    {
      number: 7,
      title: "TUTORÍA",
      description: "Documentos de tutoría, incidentes escolares y soporte familiar.",
      icon: <Users className="w-6 h-6 text-[#D97706]" />,
      colorHex: "#D97706",
      hoverColorHex: "#B45309",
      bgColorOpacity: "bg-[#D97706]/10",
      path: "/dashboard/tutoria",
    },
  ];

  // Recuperar sesión e información del docente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const showWelcome = localStorage.getItem("show_welcome_modal");
      if (showWelcome === "true") {
        setIsWelcomeOpen(true);
      }
    }

    if (searchParams.get("acceso") === "denegado") {
      setAccessDenied(true);
    }
  }, [searchParams]);

  // Rotación automática del Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("show_welcome_modal");
    }
  };

  const handleIAWidgetClick = () => {
    const botButton = document.getElementById("chatbot-toggle-button");
    if (botButton) botButton.click();
  };

  // Carrusel Handlers
  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const handleSlideAction = (url: string) => {
    if (url === "chat-trigger") {
      handleIAWidgetClick();
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 px-4 font-body text-slate-800">
      
      {/* Alerta de Acceso Denegado */}
      {accessDenied && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 shadow-sm animate-pulse">
          <span className="text-lg shrink-0">🚫</span>
          <div className="flex-1">
            <p className="font-bold">Acceso Denegado</p>
            <p className="text-xs mt-0.5 text-red-600">
              No tienes permiso para acceder al Panel de Administración. Solo usuarios con rol <strong>ADMIN</strong> pueden ingresar.
            </p>
          </div>
          <button
            onClick={() => setAccessDenied(false)}
            className="text-red-400 hover:text-red-600 transition-colors text-lg leading-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          [MÓDULO 1: NAVBAR SUPERIOR DE ACCIONES]
      ════════════════════════════════════════════════════════════════ */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-[#E8EDF3] rounded-[1.5rem] p-4 shadow-[0_1px_3px_rgba(74,90,226,0.04)] w-full">
        
        {/* Bloque Izquierdo: Saludo */}
        <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 justify-start">
          <span className="text-sm font-headings font-bold text-slate-700">
            👋 Hola, <span className="text-[#7C6CF2]">{user?.full_name?.split(" ")[0] || "Docente"}</span>
          </span>
        </div>

        {/* Buscador Central */}
        <div className="relative flex items-center w-full md:w-[420px] justify-center">
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Busca herramientas, plantillas o tutoriales..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-[#FAFBFC] focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-700 transition-colors"
            />
          </div>
        </div>

        {/* Acciones del Extremo Derecho */}
        <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto md:flex-1 shrink-0">
          
          {/* Botón de Conversión Premium */}
          <button
            onClick={() => window.location.hash = "planes"}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-headings font-bold text-[11px] shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            👑 Obtén Premium
          </button>

          {/* Campana de Notificaciones */}
          <div className="relative">
            <button className="p-2 text-slate-500 hover:text-[#7C6CF2] hover:bg-[#7C6CF2]/8 rounded-xl transition-colors cursor-pointer relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 min-w-[17px] h-4 bg-red-500 border border-white text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                9+
              </span>
            </button>
          </div>

          {/* Divisor vertical */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Bloque de Usuario */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right leading-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Cuenta
              </span>
              <span className="text-[11px] font-extrabold text-[#7C6CF2] mt-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {user?.credits !== undefined ? user.credits : 7} Créditos
              </span>
            </div>
            {/* Avatar circular */}
            <div className="w-9 h-9 rounded-full bg-[#7C6CF2]/15 border border-[#7C6CF2]/30 flex items-center justify-center font-extrabold text-[#7C6CF2] text-sm shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "D"}
            </div>
          </div>

        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          [MÓDULO 2: HERO CAROUSEL / BANNER DE PROMOCIONES]
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#7C6CF2] via-[#6858e0] to-[#5B4DC4] text-white shadow-xl min-h-[220px] flex items-center p-8 md:p-12 transition-all duration-500">
        {/* Glows decorativos */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Controles de Navegación Izquierda/Derecha */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-20"
          title="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-20"
          title="Siguiente slide"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Contenido Dinámico del Slide */}
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-4xl mx-auto z-10 duration-355 transition-all">
          <div className="flex-1 flex flex-col gap-3">
            <span className="self-start text-[9px] font-extrabold text-[#7C6CF2] bg-white px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              {CAROUSEL_SLIDES[currentSlide].badge}
            </span>
            <h2 className="font-headings font-extrabold text-2xl md:text-3.5xl tracking-tight leading-tight">
              {CAROUSEL_SLIDES[currentSlide].title}
            </h2>
            <p className="text-xs md:text-sm text-slate-100 max-w-xl leading-relaxed">
              {CAROUSEL_SLIDES[currentSlide].description}
            </p>
            <span className="text-xs font-bold text-amber-300 tracking-wide mt-1">
              ⏳ {CAROUSEL_SLIDES[currentSlide].countdown}
            </span>
          </div>

          <button
            onClick={() => handleSlideAction(CAROUSEL_SLIDES[currentSlide].actionUrl)}
            className="px-6 py-3.5 rounded-full bg-[#FFE342] hover:bg-[#FFE342]/90 text-slate-900 font-headings font-extrabold text-xs shadow-lg transition-all duration-150 active:scale-[0.98] cursor-pointer shrink-0"
          >
            {CAROUSEL_SLIDES[currentSlide].buttonText}
          </button>
        </div>

        {/* Paginador inferior (dots) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {CAROUSEL_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? "w-6 bg-white" : "bg-white/40 hover:bg-white/60"
              }`}
              title={`Ir al slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          [MÓDULO 3: GRID DE ACCESOS RÁPIDOS (3 COLUMNAS)]
      ════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tarjeta 1: Planificación */}
        <Link
          href="/dashboard/plan-anual"
          className="bg-white border border-[#E8EDF3] hover:border-[#7C6CF2]/30 rounded-2xl p-5 flex items-center gap-4 hover:shadow-[0_8px_30px_rgba(74,90,226,0.06)] transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#7C6CF2]/10 text-[#7C6CF2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5.5 h-5.5" />
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="font-headings font-bold text-xs text-slate-800 leading-tight uppercase tracking-wide">
              Crea tu Plan Anual (PDC)
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
              Genera planificaciones anuales alineadas.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        {/* Tarjeta 2: Repositorio */}
        <Link
          href="#"
          className="bg-white border border-[#E8EDF3] hover:border-[#7C6CF2]/30 rounded-2xl p-5 flex items-center gap-4 hover:shadow-[0_8px_30px_rgba(74,90,226,0.06)] transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#4A90E2]/10 text-[#4A90E2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5.5 h-5.5" />
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="font-headings font-bold text-xs text-slate-800 leading-tight uppercase tracking-wide">
              Revisa tus documentos
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
              Accede a tu historial y descargas Word.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        {/* Tarjeta 3: IA Chat */}
        <button
          onClick={handleIAWidgetClick}
          className="bg-white border border-[#E8EDF3] hover:border-[#7C6CF2]/30 rounded-2xl p-5 flex items-center gap-4 hover:shadow-[0_8px_30px_rgba(74,90,226,0.06)] transition-all duration-200 group text-left cursor-pointer w-full"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FF7657]/10 text-[#FF7657] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5.5 h-5.5" />
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="font-headings font-bold text-xs text-slate-800 leading-tight uppercase tracking-wide">
              Conversa con EduAsesor IA
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
              Pregunta dudas pedagógicas o normativas.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

      </section>

      {/* ════════════════════════════════════════════════════════════════
          [MÓDULO 4: BANNER INFERIOR DE REFERIDOS Y FIDELIZACIÓN]
      ════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-gradient-to-br from-[#FF7657]/10 to-[#FF7657]/4 border border-[#FF7657]/15 rounded-[2rem] p-8 flex flex-col gap-6 shadow-[0_1px_3px_rgba(74,90,226,0.02)]">
        
        <div className="flex flex-col gap-3">
          <span className="self-start text-[9px] font-extrabold text-[#FF7657] bg-white px-2.5 py-1 rounded border border-[#FF7657]/20 uppercase tracking-widest shadow-sm">
            🚀 RECOMIENDA Y GANA
          </span>
          <h3 className="font-headings font-black text-2xl text-slate-900 leading-tight">
            Tus clases, sin límites
          </h3>
          <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed max-w-2xl">
            Invita a un colega docente y ambos recibirán 5 créditos de regalo en sus cuentas. O pásate a Premium ahora mismo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-start">
          <button
            onClick={() => alert("¡Función de referidos próximamente disponible! Comparte tu enlace con tus colegas.")}
            className="px-6 py-3 rounded-full bg-[#FF7657] hover:bg-[#e6684a] text-white font-headings font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            Invitar colega
          </button>
          <button
            onClick={() => window.location.hash = "planes"}
            className="px-6 py-3 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100/50 font-headings font-bold text-xs transition-colors cursor-pointer"
          >
            Hazte Premium
          </button>
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════
          [MÓDULO 5: SECCIÓN DE HERRAMIENTAS GENERALES (FOOTER DEL CONTENIDO)]
      ════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5.5 h-5.5 text-[#7C6CF2]" />
          <h2 className="text-2xl font-headings font-black text-slate-900 tracking-tight">
            Nuestras herramientas
          </h2>
        </div>

        {/* Rejilla de Módulos Pedagógicos de AVENDIA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.title}
              className="bg-white border border-[#E8EDF3] hover:border-[#7C6CF2]/30 rounded-2xl p-5 shadow-[0_1px_3px_rgba(74,90,226,0.04)] hover:shadow-md transition-all duration-200 flex flex-col justify-between items-center text-center min-h-[260px] group"
            >
              {/* Icono */}
              <div className={`w-12 h-12 rounded-full ${mod.bgColorOpacity} flex items-center justify-center text-xl mb-4 shrink-0 group-hover:scale-105 transition-transform`}>
                {mod.icon}
              </div>

              {/* Título */}
              <div className="mb-2">
                <span
                  style={{ color: mod.colorHex }}
                  className="font-headings font-extrabold text-[9px] uppercase tracking-widest block mb-1"
                >
                  {mod.number}. Módulo
                </span>
                <h3 className="font-headings font-extrabold text-xs text-slate-900 leading-snug">
                  {mod.title}
                </h3>
              </div>

              {/* Descripción */}
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mt-1 mb-4 flex-1 flex items-center">
                {mod.description}
              </p>

              {/* Botón de ingreso */}
              <Link
                href={mod.path}
                style={{
                  backgroundColor: mod.colorHex,
                  boxShadow: `0 4px 12px ${mod.colorHex}25`
                }}
                className="w-full py-2.5 rounded-xl text-white font-headings font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all hover:opacity-95 cursor-pointer active:scale-[0.97]"
              >
                <span>Ingresar</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <WelcomeModal isOpen={isWelcomeOpen} onClose={handleCloseWelcome} />
    </div>
  );
}

// Wrapper para Suspense
export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#7C6CF2] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Cargando panel...</p>
          </div>
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
