"use client";

import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { ToolItem } from "./toolTypes";

interface ToolCardProps {
  tool: ToolItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export default function ToolCard({ tool, isFavorite, onToggleFavorite }: ToolCardProps) {
  return (
    <div className="bg-white border border-slate-100 hover:border-[#7C6CF2]/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[230px] relative group">
      {/* Botón de favorito en la esquina superior derecha */}
      <button
        onClick={(e) => onToggleFavorite(tool.id, e)}
        className="absolute top-4.5 right-4.5 p-1.5 rounded-full bg-slate-50 hover:bg-amber-50 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer z-10"
        title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        <Star className={`w-4 h-4 transition-colors ${isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
      </button>

      {/* Header de la Tarjeta */}
      <div className="flex flex-col gap-4">
        {/* Fila del Icono y el Badge */}
        <div className="flex items-center justify-between pr-8">
          {/* Contenedor del Icono cuadrado suave */}
          <div className={`w-11 h-11 rounded-xl ${tool.iconBg} ${tool.iconColor} flex items-center justify-center`}>
            {tool.icon}
          </div>

          {/* Insignia de Categoría (Badge) */}
          <span
            className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              tool.category === "Planificación"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-purple-50 text-[#7C6CF2] border border-purple-100"
            }`}
          >
            {tool.category}
          </span>
        </div>

        {/* Título y Descripción */}
        <div className="flex flex-col gap-1.5">
          <h3 className="font-headings font-bold text-sm text-slate-800 tracking-tight leading-snug">
            {tool.title}
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Botón de Acción inferior */}
      <Link
        href={tool.path}
        className="mt-4 self-start text-xs font-bold text-[#7C6CF2] hover:text-[#5B4DC4] transition-colors flex items-center gap-1 group/link"
      >
        <span>Empezar creación</span>
        <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
      </Link>
    </div>
  );
}
