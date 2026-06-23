"use client";

import React from "react";
import { Search } from "lucide-react";

interface ToolFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CATEGORIES = ["Todas", "Favoritos", "Planificación", "Asistente"];

export default function ToolFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: ToolFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full bg-white border border-[#E8EDF3] rounded-[1.5rem] p-4 shadow-[0_1px_3px_rgba(74,90,226,0.04)]">
      {/* Píldoras de Categoría - Categorías del RTCFR exactas */}
      <div className="flex flex-wrap gap-2 order-2 md:order-1">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-[#7C6CF2] border-[#7C6CF2] text-white shadow-md shadow-[#7C6CF2]/15"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Buscador Central */}
      <div className="relative w-full md:w-80 order-1 md:order-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca herramientas o tutoriales"
          className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-[#FAFBFC] focus:outline-none focus:border-[#7C6CF2] text-xs text-slate-700 transition-colors"
        />
      </div>
    </div>
  );
}
