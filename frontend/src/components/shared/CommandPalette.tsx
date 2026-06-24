"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Book,
  FileText,
  BookOpen,
  Award,
  ClipboardList,
  Users,
  Star,
  Home,
  User,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";

interface CommandItem {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
  };

  // List of all commands and navigation routes
  const commands: CommandItem[] = [
    {
      id: "inicio",
      name: "Ir a Inicio (Dashboard)",
      category: "Navegación",
      icon: <Home className="w-4 h-4" />,
      action: () => router.push("/dashboard"),
    },
    {
      id: "plan-anual",
      name: "Crear Plan Anual (PDC)",
      category: "Herramientas de Planificación",
      icon: <Calendar className="w-4 h-4 text-[#7C6CF2]" />,
      action: () => router.push("/dashboard/plan-anual"),
    },
    {
      id: "unidades",
      name: "Diseñar Unidades de Aprendizaje",
      category: "Herramientas de Planificación",
      icon: <Book className="w-4 h-4 text-[#4A90E2]" />,
      action: () => router.push("/dashboard/unidades"),
    },
    {
      id: "sesiones",
      name: "Planificar Sesión de Aprendizaje",
      category: "Herramientas de Planificación",
      icon: <FileText className="w-4 h-4 text-[#16A34A]" />,
      action: () => router.push("/dashboard/sesiones"),
    },
    {
      id: "fichas",
      name: "Generar Fichas de Aprendizaje",
      category: "Herramientas de Planificación",
      icon: <BookOpen className="w-4 h-4 text-[#EA580C]" />,
      action: () => router.push("/dashboard/fichas-aprendizaje"),
    },
    {
      id: "rubrica",
      name: "Crear Rúbrica de Evaluación",
      category: "Evaluación y Aula",
      icon: <Award className="w-4 h-4 text-[#E11D48]" />,
      action: () => router.push("/dashboard/rubrica-evaluacion"),
    },
    {
      id: "lista-cotejo",
      name: "Elaborar Lista de Cotejo",
      category: "Evaluación y Aula",
      icon: <ClipboardList className="w-4 h-4 text-[#0D9488]" />,
      action: () => router.push("/dashboard/lista-cotejo"),
    },
    {
      id: "tutoria",
      name: "Módulo de Tutoría e Incidencias",
      category: "Evaluación y Aula",
      icon: <Users className="w-4 h-4 text-[#D97706]" />,
      action: () => router.push("/dashboard/tutoria"),
    },
    {
      id: "aulas",
      name: "Ver Mis Aulas",
      category: "Navegación",
      icon: <Users className="w-4 h-4" />,
      action: () => router.push("/dashboard/aulas"),
    },
    {
      id: "documentos",
      name: "Historial de Documentos",
      category: "Navegación",
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push("/dashboard/documentos"),
    },
    {
      id: "salas",
      name: "Salas Avendia",
      category: "Navegación",
      icon: <Users className="w-4 h-4" />,
      action: () => router.push("/dashboard/salas"),
    },
    {
      id: "referidos",
      name: "Invitar Colegas (Referidos)",
      category: "Cuenta",
      icon: <Star className="w-4 h-4 text-amber-500" />,
      action: () => router.push("/dashboard/referidos"),
    },
    {
      id: "perfil",
      name: "Ajustes de Perfil / RAG",
      category: "Cuenta",
      icon: <User className="w-4 h-4" />,
      action: () => router.push("/dashboard/perfil"),
    },
    {
      id: "theme",
      name: "Alternar Modo Oscuro (Claro / Oscuro)",
      category: "Preferencias",
      icon: <Moon className="w-4 h-4 text-slate-500 dark:text-yellow-400" />,
      action: toggleDarkMode,
    },
  ];

  // Filter commands by search input
  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Global keyboard listener for command palette trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle arrows, escape, enter keyboard interactions
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center pt-[15vh] z-50 p-4 font-body">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[60vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search input container */}
        <div className="relative border-b border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3 shrink-0">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Escribe una herramienta o comando... (ej: 'Modo Oscuro', 'rúbrica')"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full text-sm bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
            ESC
          </kbd>
        </div>

        {/* List of filtered commands */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-semibold flex flex-col items-center gap-2">
              <span>🚫 Sin resultados para "{search}"</span>
              <span className="text-[10px] text-slate-350">Intenta buscar "plan", "rubrica" o "modo"</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {/* Grouping header placeholder for category mapping if we want category titles */}
              {(() => {
                let lastCategory = "";
                return filteredCommands.map((cmd, idx) => {
                  const showHeader = cmd.category !== lastCategory;
                  lastCategory = cmd.category;
                  const isSelected = idx === selectedIndex;
                  return (
                    <React.Fragment key={cmd.id}>
                      {showHeader && (
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 pt-3 pb-1 block">
                          {cmd.category}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-150 select-none ${
                          isSelected
                            ? "bg-gradient-to-r from-morado-ia/10 to-morado-ia/5 border border-morado-ia/15 text-morado-ia dark:text-purple-300"
                            : "border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`p-1.5 rounded-lg ${isSelected ? "bg-morado-ia/15 text-morado-ia" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                            {cmd.icon}
                          </span>
                          <span>{cmd.name}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[9px] font-bold text-morado-ia/60 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-morado-ia" />
                            Seleccionado
                          </span>
                        )}
                      </button>
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded font-mono">↑↓</kbd> Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded font-mono">Enter</kbd> Ejecutar
            </span>
          </div>
          <div className="hidden sm:block">
            <span>Presiona <kbd className="px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded font-mono">Ctrl + K</kbd> en cualquier parte</span>
          </div>
        </div>
      </div>
    </div>
  );
}
