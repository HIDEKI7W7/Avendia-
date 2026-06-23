"use client";

import React, { useState, useEffect } from "react";
import ToolFilters from "@/components/dashboard/ToolFilters";
import ToolCard from "@/components/dashboard/ToolCard";
import { ToolItem } from "@/components/dashboard/toolTypes";
import { Calendar, Book, FileText, MessageSquare, Sparkles } from "lucide-react";

export default function HerramientasDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Nuestras 4 herramientas reales de AVENDIA
  const OFFICIAL_TOOLS: ToolItem[] = [
    {
      id: "pca",
      title: "Plan Curricular Anual (PCA)",
      category: "Planificación",
      description: "Estructura la columna vertebral pedagógica de tu año escolar alineada a las normativas vigentes del MINEDU.",
      icon: <Calendar className="w-5.5 h-5.5" />,
      iconBg: "bg-emerald-50 border border-emerald-100",
      iconColor: "text-emerald-600",
      path: "/dashboard/plan-anual",
    },
    {
      id: "unidad",
      title: "Unidad de Aprendizaje",
      category: "Planificación",
      description: "Diseña unidades didácticas integradas con situaciones significativas de manera automática.",
      icon: <Book className="w-5.5 h-5.5" />,
      iconBg: "bg-blue-50 border border-blue-100",
      iconColor: "text-blue-600",
      path: "/dashboard/unidades",
    },
    {
      id: "sesion",
      title: "Sesión de Aprendizaje",
      category: "Planificación",
      description: "Genera secuencias pedagógicas detalladas con momentos, estrategias y tiempos a medida.",
      icon: <FileText className="w-5.5 h-5.5" />,
      iconBg: "bg-rose-50 border border-rose-100",
      iconColor: "text-rose-600",
      path: "/dashboard/sesiones",
    },
    {
      id: "rag",
      title: "EduAsesor RAG",
      category: "Asistente",
      description: "Tu consultor administrativo inteligente para resolver dudas sobre normativas pedagógicas.",
      icon: <MessageSquare className="w-5.5 h-5.5" />,
      iconBg: "bg-purple-50 border border-purple-100",
      iconColor: "text-[#7C6CF2]",
      path: "/dashboard/chat",
    },
  ];

  // Cargar favoritos del localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("avendia_favorite_tools");
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (e) {
          console.error("Error al cargar favoritos:", e);
        }
      }
    }
  }, []);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    
    setFavorites(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("avendia_favorite_tools", JSON.stringify(updated));
    }
  };

  // Filtrado reactivo en tiempo real
  const filteredTools = OFFICIAL_TOOLS.filter((tool) => {
    // 1. Filtrado por búsqueda de texto
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Filtrado por píldoras de categoría
    let matchesCategory = true;
    if (selectedCategory === "Favoritos") {
      matchesCategory = favorites.includes(tool.id);
    } else if (selectedCategory !== "Todas") {
      matchesCategory = tool.category === selectedCategory;
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 font-body">
      {/* Título de Sección */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5.5 h-5.5 text-[#7C6CF2]" />
        <h1 className="text-2xl font-headings font-black text-slate-900 tracking-tight">
          Explora nuestras herramientas
        </h1>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <ToolFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Grid de Herramientas Reales de AVENDIA */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-2xl text-center gap-3">
          <span className="text-3xl">🔍</span>
          <p className="text-sm font-headings font-bold text-slate-800">
            No se encontraron herramientas
          </p>
          <p className="text-xs text-slate-400 font-semibold max-w-xs">
            Prueba ajustando tu búsqueda o seleccionando otra categoría.
          </p>
        </div>
      )}
    </div>
  );
}
