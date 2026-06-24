import React from "react";
import { Bell } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface ProfileHeaderBadgeProps {
  onClick: () => void;
}

export default function ProfileHeaderBadge({ onClick }: ProfileHeaderBadgeProps) {
  const { user } = useUser();
  const initials = user?.full_name ? user.full_name.charAt(0).toUpperCase() : "D";

  return (
    <div className="flex items-center gap-x-5 shrink-0 select-none">
      {/* Campana de Notificaciones */}
      <div className="relative">
        <button className="p-2 text-slate-500 hover:text-[#7C6CF2] hover:bg-[#7C6CF2]/8 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer relative">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute -top-1 -right-1 min-w-[17px] h-4 bg-red-500 border border-white text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
            9+
          </span>
        </button>
      </div>

      {/* Divisor vertical */}
      <div className="h-6 w-px bg-slate-200" />

      {/* Botón Disparador del Perfil */}
      <button
        onClick={onClick}
        className="flex items-center gap-3 text-left hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer"
      >
        <div className="flex flex-col text-right leading-none">
          <span className="text-[10px] font-headings font-black text-slate-800 uppercase tracking-wide">
            Cuenta
          </span>
          <span className="text-[10px] font-extrabold text-[#7C6CF2] mt-1 flex items-center gap-1 font-variant-numeric-tabular-nums">
            <span className="text-[8px] text-[#7C6CF2]">●</span> {user?.credits !== undefined ? user.credits : 7} Créditos AVENDIA
          </span>
        </div>

        {/* Avatar circular color vino/morado */}
        <div className="w-9 h-9 rounded-full bg-[#5C1D42] border border-[#7C6CF2]/20 flex items-center justify-center font-headings font-black text-white text-sm shrink-0 shadow-md">
          {initials}
        </div>
      </button>
    </div>
  );
}
