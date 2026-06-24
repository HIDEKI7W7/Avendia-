import React from "react";

interface PremiumButtonProps {
  onClick: () => void;
}

export default function PremiumButton({ onClick }: PremiumButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center px-4 py-1.5 rounded-full bg-[#FF9F43] hover:bg-[#F28E2B] text-slate-950 shadow-[0_4px_12px_rgba(255,159,67,0.3)] hover:shadow-[0_6px_16px_rgba(255,159,67,0.4)] transition-all duration-300 active:scale-[0.96] hover:scale-[1.04] cursor-pointer"
    >
      <span className="text-sm leading-none mb-0.5 filter drop-shadow">👑</span>
      <span className="font-headings font-black text-[9px] tracking-tight uppercase leading-[1.1] text-center">
        Obtén<br />Premium
      </span>
    </button>
  );
}
