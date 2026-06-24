"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BACKEND_URL } from "@/config/api";
import WelcomeModal from "@/components/auth/WelcomeModal";
import { useUser } from "@/context/UserContext";
import PremiumButton from "@/components/dashboard/PremiumButton";
import PricingModal from "@/components/dashboard/PricingModal";
import ProfileHeaderBadge from "@/components/layout/ProfileHeaderBadge";
import {
  Calendar,
  Book,
  FileText,
  BookOpen,
  Award,
  ClipboardList,
  Users,
  Star,
  Sparkles,
  Plus,
  Coins,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Search,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & DATA STRUCTURES
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
  category: "Planificar" | "Evaluar" | "Gestionar";
}

interface ChartPoint {
  label: string;
  val: number;
}

interface DoughnutSegment {
  label: string;
  percent: number;
  color: string;
  value: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTE DE GRÁFICO A: LÍNEAS NATIVO SVG
// ═══════════════════════════════════════════════════════════════════════════
function ProgressLineChart() {
  const points: ChartPoint[] = [
    { label: "Ene", val: 8 },
    { label: "Feb", val: 12 },
    { label: "Mar", val: 18 },
    { label: "Abr", val: 14 },
    { label: "May", val: 22 },
    { label: "Jun", val: 24 },
  ];

  const getX = (index: number) => 50 + index * 80;
  const getY = (val: number) => 160 - (val / 30) * 130;

  let pathD = `M ${getX(0)} ${getY(points[0].val)}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${getX(i)} ${getY(points[i].val)}`;
  }

  const areaD = `${pathD} L ${getX(points.length - 1)} 160 L ${getX(0)} 160 Z`;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-[#E8EDF3] dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(74,90,226,0.02)] transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="font-headings font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Progreso de Proyectos Curriculares
          </h4>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
            Evolución mensual (Ene - Jun) de planificaciones generadas
          </p>
        </div>
        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
          <TrendingUp className="w-2.5 h-2.5" /> +35% este mes
        </span>
      </div>

      <div className="relative w-full h-44">
        <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C6CF2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7C6CF2" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4A90E2" />
              <stop offset="100%" stopColor="#7C6CF2" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="50" y1="30" x2="450" y2="30" stroke="#F1F5F9" strokeWidth="1" className="dark:stroke-slate-800/60" />
          <line x1="50" y1="95" x2="450" y2="95" stroke="#F1F5F9" strokeWidth="1" className="dark:stroke-slate-800/60" />
          <line x1="50" y1="160" x2="450" y2="160" stroke="#E2E8F0" strokeWidth="1.5" className="dark:stroke-slate-800" />

          {/* Y Axis labels */}
          <text x="35" y="34" fontSize="8" fontWeight="bold" fill="#94A3B8" textAnchor="end">30</text>
          <text x="35" y="99" fontSize="8" fontWeight="bold" fill="#94A3B8" textAnchor="end">15</text>
          <text x="35" y="164" fontSize="8" fontWeight="bold" fill="#94A3B8" textAnchor="end">0</text>

          {/* Area fill */}
          <path d={areaD} fill="url(#area-grad)" />

          {/* Line path */}
          <path d={pathD} fill="none" stroke="url(#line-grad)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Dots */}
          {points.map((p, idx) => (
            <g key={idx} className="group/dot cursor-pointer">
              <circle
                cx={getX(idx)}
                cy={getY(p.val)}
                r="4.5"
                fill="#FFFFFF"
                stroke="#7C6CF2"
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y="188"
              fontSize="8"
              fontWeight="bold"
              fill="#94A3B8"
              textAnchor="middle"
              className="dark:fill-slate-500"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTE DE GRÁFICO B: ANILLO NATIVO SVG
// ═══════════════════════════════════════════════════════════════════════════
function TasksPieChart() {
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 314.159
  
  const segments: DoughnutSegment[] = [
    { label: "Completadas", percent: 50, color: "#34D399", value: "39 tareas" },
    { label: "En Proceso", percent: 25, color: "#7DD3FC", value: "19 tareas" },
    { label: "Pendientes", percent: 15, color: "#FBBF24", value: "12 tareas" },
    { label: "Atrasadas", percent: 10, color: "#EF4444", value: "8 tareas" },
  ];

  let accumulatedPercent = 0;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-[#E8EDF3] dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_4px_25px_rgba(74,90,226,0.02)] transition-colors duration-300">
      <div>
        <h4 className="font-headings font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
          Tareas por Estado
        </h4>
        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
          Clasificación curricular de las actividades docentes del aula
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
        {/* Doughnut SVG Container */}
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {segments.map((seg, idx) => {
              const strokeDasharray = `${(seg.percent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += seg.percent;

              return (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="11"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none select-none">
            <span className="text-xl font-headings font-black text-slate-850 dark:text-white">78%</span>
            <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Avance</span>
          </div>
        </div>

        {/* Legend block */}
        <div className="flex-1 flex flex-col gap-2.5 w-full">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-slate-650 dark:text-slate-400 text-[11px]">{seg.label}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-900 dark:text-slate-100 text-[11px]">{seg.percent}%</span>
                <span className="text-[8px] text-slate-400 dark:text-slate-500 block font-normal">{seg.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DEL DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function DashboardPageContent() {
  const searchParams = useSearchParams();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const { user } = useUser();

  // Filtro de Módulos Pedagógicos
  const [activeTab, setActiveTab] = useState<"Todos" | "Planificar" | "Evaluar" | "Gestionar">("Todos");

  // Catálogo de Módulos Pedagógicos Oficiales de AVENDIA
  const modules: PedagogicalModule[] = [
    {
      number: 1,
      title: "PLAN ANUAL",
      description: "Crea tu planificación anual de forma estructurada alineada al CNEB.",
      icon: <Calendar className="w-5.5 h-5.5 text-[#7C6CF2]" />,
      colorHex: "#7C6CF2",
      hoverColorHex: "#6B5AE0",
      bgColorOpacity: "bg-[#7C6CF2]/8",
      path: "/dashboard/plan-anual",
      category: "Planificar",
    },
    {
      number: 2,
      title: "UNIDADES",
      description: "Diseña unidades de aprendizaje alineadas al currículo y competencias.",
      icon: <Book className="w-5.5 h-5.5 text-[#4A90E2]" />,
      colorHex: "#4A90E2",
      hoverColorHex: "#357ABD",
      bgColorOpacity: "bg-[#4A90E2]/8",
      path: "/dashboard/unidades",
      category: "Planificar",
    },
    {
      number: 3,
      title: "SESIONES",
      description: "Planifica sesiones de aprendizaje efectivas y significativas paso a paso.",
      icon: <FileText className="w-5.5 h-5.5 text-[#16A34A]" />,
      colorHex: "#16A34A",
      hoverColorHex: "#15803D",
      bgColorOpacity: "bg-[#16A34A]/8",
      path: "/dashboard/sesiones",
      category: "Planificar",
    },
    {
      number: 4,
      title: "FICHAS DE APRENDIZAJE",
      description: "Genera fichas y actividades de refuerzo listas para imprimir y aplicar.",
      icon: <BookOpen className="w-5.5 h-5.5 text-[#EA580C]" />,
      colorHex: "#EA580C",
      hoverColorHex: "#C2410C",
      bgColorOpacity: "bg-[#EA580C]/8",
      path: "/dashboard/fichas-aprendizaje",
      category: "Planificar",
    },
    {
      number: 5,
      title: "RÚBRICA DE EVALUACIÓN",
      description: "Crea rúbricas de evaluación claras y objetivas por competencias.",
      icon: <Award className="w-5.5 h-5.5 text-[#E11D48]" />,
      colorHex: "#E11D48",
      hoverColorHex: "#BE123C",
      bgColorOpacity: "bg-[#E11D48]/8",
      path: "/dashboard/rubrica-evaluacion",
      category: "Evaluar",
    },
    {
      number: 6,
      title: "LISTA DE COTEJO",
      description: "Elabora listas de cotejo sencillas y escalas de valoración en segundos.",
      icon: <ClipboardList className="w-5.5 h-5.5 text-[#0D9488]" />,
      colorHex: "#0D9488",
      hoverColorHex: "#0F766E",
      bgColorOpacity: "bg-[#0D9488]/8",
      path: "/dashboard/lista-cotejo",
      category: "Evaluar",
    },
    {
      number: 7,
      title: "TUTORÍA",
      description: "Documentos de tutoría, incidentes escolares y soporte familiar.",
      icon: <Users className="w-5.5 h-5.5 text-[#D97706]" />,
      colorHex: "#D97706",
      hoverColorHex: "#B45309",
      bgColorOpacity: "bg-[#D97706]/8",
      path: "/dashboard/tutoria",
      category: "Gestionar",
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

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("show_welcome_modal");
    }
  };

  // Helper trigger para la paleta de comandos
  const handleOpenCommandPalette = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
      );
    }
  };

  // Lógica de Saludo Dinámico Empático
  const getGreeting = () => {
    const docName = user?.full_name?.split(" ")[0] || "Docente";
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return `¡Buenos días, ${docName}! ☀️ Aquí tienes un resumen de tu planificación.`;
    } else if (hour < 19) {
      return `¡Buenas tardes, ${docName}! 🌤️ Aquí tienes un resumen de tu planificación.`;
    } else {
      return `¡Buenas noches, ${docName}! 🌙 Aquí tienes un resumen de tu planificación.`;
    }
  };

  const filteredModules = activeTab === "Todos" 
    ? modules 
    : modules.filter((m) => m.category === activeTab);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 px-4 font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Alerta de Acceso Denegado */}
      {accessDenied && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-750 shadow-sm animate-pulse">
          <span className="text-lg shrink-0">🚫</span>
          <div className="flex-1">
            <p className="font-bold">Acceso Denegado</p>
            <p className="text-xs mt-0.5 text-red-650">
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
          [LÍNEA DE NAVEGACIÓN GLOBAL SUPERIOR (TOP UTILITY BAR)]
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full py-2 shrink-0">
        {/* Lado izquierdo: Botones de Acción */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-start select-none">
          <button
            onClick={handleOpenCommandPalette}
            className="px-5 py-2.5 rounded-2xl bg-[#7C6CF2] hover:bg-[#6858E0] text-white font-headings font-black text-xs shadow-md shadow-[#7C6CF2]/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Nuevo proyecto</span>
          </button>
          
          <PremiumButton onClick={() => setIsPricingOpen(true)} />
        </div>

        {/* Lado derecho: Buscador, Notificaciones y Perfil */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 select-none">
          {/* Buscador minimalista */}
          <button
            onClick={handleOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-[#7C6CF2] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200/40 dark:border-slate-850"
            title="Buscar (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-wide hidden md:inline">Buscar (Ctrl+K)</span>
          </button>

          {/* Badge del Perfil con campana y avatar */}
          <ProfileHeaderBadge onClick={() => window.location.href = "/dashboard/perfil"} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          [NUEVO HERO BANNER DE METRICAS Y BIENVENIDA]
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-950 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-955 text-white rounded-[2rem] p-6 sm:p-8 flex flex-col xl:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-[0_20px_50px_rgba(30,41,59,0.12)] transition-all duration-300">
        
        {/* Glows decorativos de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-[#7C6CF2]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Lado Izquierdo: Saludo dinámico + Mascota */}
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 z-10 w-full">
          {/* Contenedor circular de la Mascota */}
          <div className="w-20 h-20 shrink-0 bg-white/10 dark:bg-slate-800/30 rounded-full flex items-center justify-center border border-white/20 dark:border-slate-800/40 shadow-inner overflow-hidden select-none relative group">
            {/* Glowing bubble */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7C6CF2]/10 to-[#FF7657]/10 rounded-full blur-md animate-pulse" />
            <img
              src="/kawaii_teacher.png"
              alt="Mascota Kawaii Avendia"
              className="w-16 h-16 object-contain relative z-10 drop-shadow-md transform group-hover:scale-110 group-hover:translate-y-[-2px] transition-all duration-300"
            />
            {/* mini check overlay */}
            <div className="absolute top-0 right-0 bg-[#34D399] border border-white text-white rounded-full w-4 h-4 flex items-center justify-center shadow-md text-[6px] z-20">
              ✓
            </div>
          </div>

          {/* Saludo dinámico y subtítulo */}
          <div className="text-center sm:text-left">
            <h2 className="font-montserrat font-black text-2xl sm:text-3xl tracking-tight leading-tight text-white">
              ¡Hola, {user?.full_name?.split(" ")[0] || "Docente"}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 mt-2 font-medium max-w-md leading-relaxed">
              Listo para crear materiales pedagógicos significativos y alineados al CNEB 2026 hoy.
            </p>
          </div>
        </div>

        {/* Lado Derecho: 3 Tarjetas de Métricas Vidriadas (Glassmorphism) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full xl:w-auto z-10 shrink-0 select-none">
          {/* Card 1: Áreas Asignadas */}
          <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/10 dark:border-slate-800/40 rounded-2xl p-4 flex flex-col justify-between min-w-[155px] shadow-lg">
            <span className="text-[9px] font-bold text-blue-200 dark:text-slate-400 uppercase tracking-widest leading-none">Áreas asignadas</span>
            <span className="text-2xl font-headings font-black text-white mt-2">
              {user?.subject ? "1" : "3"}
            </span>
            <span className="text-[9px] font-semibold text-blue-100/70 dark:text-slate-400 mt-1 block max-w-[120px] truncate" title={user?.subject || "Planificación Integral"}>
              {user?.subject || "Matemática y Ciencias"}
            </span>
          </div>

          {/* Card 2: Docs Generados */}
          <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/10 dark:border-slate-800/40 rounded-2xl p-4 flex flex-col justify-between min-w-[155px] shadow-lg">
            <span className="text-[9px] font-bold text-blue-200 dark:text-slate-400 uppercase tracking-widest leading-none">Docs generados</span>
            <span className="text-2xl font-headings font-black text-white mt-2">24</span>
            <span className="text-[9px] font-semibold text-blue-100/70 dark:text-slate-400 mt-1 block">12 este mes</span>
          </div>

          {/* Card 3: Créditos */}
          <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/10 dark:border-slate-800/40 rounded-2xl p-4 flex flex-col justify-between min-w-[155px] shadow-lg">
            <span className="text-[9px] font-bold text-blue-200 dark:text-slate-400 uppercase tracking-widest leading-none">Créditos</span>
            <span className="text-2xl font-headings font-black text-white mt-2">
              {user?.credits !== undefined ? user.credits : 7}
            </span>
            <span className="text-[9px] font-semibold text-blue-100/70 dark:text-slate-400 mt-1 block">
              de {user?.credits_total ?? 7} libres
            </span>
          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════
          [MÓDULO 2.5: CENTRO DE CONTROL DOCENTE — METRICAS ADICIONALES]
      ════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {/* Card 1: Proyectos Activos */}
        <div className="bg-white dark:bg-slate-900 border border-[#E8EDF3] dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(74,90,226,0.01)] hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Proyectos Activos</span>
            <span className="text-2xl font-headings font-black text-slate-900 dark:text-white mt-1">24</span>
            <span className="text-[8px] font-bold text-emerald-500 mt-1 flex items-center gap-0.5">↑ 12% este mes</span>
          </div>
          <div className="w-14 h-9 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 60 30">
              <path
                d="M 5,25 L 15,22 L 25,18 L 35,12 L 45,14 L 55,5"
                fill="none"
                stroke="#7C6CF2"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="55" cy="5" r="2" fill="#7C6CF2" />
            </svg>
          </div>
        </div>

        {/* Card 2: Tareas Completadas */}
        <div className="bg-white dark:bg-slate-900 border border-[#E8EDF3] dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(74,90,226,0.01)] hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Tareas Completadas</span>
            <span className="text-2xl font-headings font-black text-slate-900 dark:text-white mt-1">78%</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1">64 / 82 completadas</span>
          </div>
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#F1F5F9" strokeWidth="3" className="dark:stroke-slate-800" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="transparent"
                stroke="#34D399"
                strokeWidth="3"
                strokeDasharray={`${0.78 * 2 * Math.PI * 14} ${2 * Math.PI * 14}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[8px] font-extrabold text-[#34D399]">78%</span>
          </div>
        </div>

        {/* Card 3: Recursos Utilizados */}
        <div className="bg-white dark:bg-slate-900 border border-[#E8EDF3] dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(74,90,226,0.01)] hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Recursos Utilizados</span>
            <span className="text-2xl font-headings font-black text-slate-900 dark:text-white mt-1">65%</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1">130 GB / 200 GB</span>
          </div>
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#F1F5F9" strokeWidth="3" className="dark:stroke-slate-800" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="transparent"
                stroke="#7DD3FC"
                strokeWidth="3"
                strokeDasharray={`${0.65 * 2 * Math.PI * 14} ${2 * Math.PI * 14}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[8px] font-extrabold text-[#4A90E2]">65%</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          [MÓDULO 3: GRID DE GRAFICAS DE PRODUCTIVIDAD DOCENTE]
      ════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gráfico A: Progreso de Proyectos */}
        <ProgressLineChart />

        {/* Gráfico B: Tareas por Estado */}
        <TasksPieChart />

      </section>

      {/* ════════════════════════════════════════════════════════════════
          [MÓDULO 4: SECCIÓN DE HERRAMIENTAS PEDAGÓGICAS CON FILTRADO]
      ════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-6 mt-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EDF3] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5.5 h-5.5 text-[#7C6CF2]" />
            <h3 className="text-xl font-headings font-black text-slate-900 dark:text-white tracking-tight">
              Herramientas de Planificación y Aula
            </h3>
          </div>

          {/* Pestañas de filtrado (Planificar, Evaluar, Gestionar) */}
          <div className="bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl flex gap-1 self-start sm:self-auto select-none border border-slate-200/40 dark:border-slate-700/40">
            {(["Todos", "Planificar", "Evaluar", "Gestionar"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-750 dark:text-slate-400"
                }`}
              >
                {tab === "Planificar" ? "Planificar 📅" : tab === "Evaluar" ? "Evaluar 📊" : tab === "Gestionar" ? "Gestionar ⚙️" : "Todos"}
              </button>
            ))}
          </div>
        </div>

        {/* Rejilla filtrada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredModules.map((mod) => (
            <div
              key={mod.title}
              className="bg-white dark:bg-slate-900 border border-[#E8EDF3] dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(74,90,226,0.02)] hover:shadow-md transition-all duration-200 flex flex-col justify-between items-center text-center min-h-[260px] group"
            >
              {/* Icono circular */}
              <div className={`w-12 h-12 rounded-full ${mod.bgColorOpacity} flex items-center justify-center mb-4 shrink-0 group-hover:scale-105 transition-transform`}>
                {mod.icon}
              </div>

              {/* Títulos */}
              <div className="mb-2">
                <span
                  style={{ color: mod.colorHex }}
                  className="font-headings font-extrabold text-[9px] uppercase tracking-widest block mb-1"
                >
                  {mod.number}. Módulo • {mod.category}
                </span>
                <h4 className="font-headings font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                  {mod.title}
                </h4>
              </div>

              {/* Descripción */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mt-1 mb-4 flex-1 flex items-center">
                {mod.description}
              </p>

              {/* Botón ingresar */}
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

          {filteredModules.length === 0 && (
            <div className="col-span-full py-12 border border-dashed border-[#E8EDF3] dark:border-slate-800 rounded-3xl text-center text-slate-400 font-semibold italic text-xs">
              No hay herramientas para esta categoría en este momento.
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          [MÓDULO 5: BANNER INFERIOR DE REFERIDOS Y FIDELIZACIÓN]
      ════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-gradient-to-br from-[#FF7657]/8 to-[#FF7657]/4 border border-[#FF7657]/15 rounded-[2rem] p-8 flex flex-col gap-6 shadow-[0_1px_3px_rgba(74,90,226,0.01)] mt-4">
        
        <div className="flex flex-col gap-3">
          <span className="self-start text-[9px] font-extrabold text-[#FF7657] bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-[#FF7657]/20 uppercase tracking-widest shadow-sm">
            🚀 RECOMIENDA Y GANA
          </span>
          <h3 className="font-headings font-black text-2xl text-slate-900 dark:text-white leading-tight">
            Tus clases, sin límites
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-450 font-semibold leading-relaxed max-w-2xl">
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
            onClick={() => setIsPricingOpen(true)}
            className="px-6 py-3 rounded-full bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-100/50 font-headings font-bold text-xs transition-colors cursor-pointer"
          >
            Hazte Premium
          </button>
        </div>

      </section>

      <WelcomeModal isOpen={isWelcomeOpen} onClose={handleCloseWelcome} />
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  );
}

// Wrapper con Suspense
export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#FAFBFC] dark:bg-slate-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#7C6CF2] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Cargando panel...</p>
          </div>
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
