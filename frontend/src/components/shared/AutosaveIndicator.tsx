"use client";

import React, { useState, useEffect } from "react";
import { Cloud, CloudLightning, Check, RefreshCw } from "lucide-react";

interface AutosaveIndicatorProps {
  isSaving?: boolean;
}

export default function AutosaveIndicator({ isSaving }: AutosaveIndicatorProps) {
  const [localSaving, setLocalSaving] = useState(false);

  // If the parent controls the saving state, listen to it
  useEffect(() => {
    if (isSaving !== undefined) {
      setLocalSaving(isSaving);
    }
  }, [isSaving]);

  // If parent does not pass isSaving, we can simulate occasional background auto-saves
  useEffect(() => {
    if (isSaving !== undefined) return;

    // Simulate saving on mount to show it works
    setLocalSaving(true);
    const timer = setTimeout(() => {
      setLocalSaving(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isSaving]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-250/60 dark:border-slate-700/60 rounded-full select-none text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-colors duration-300">
      {localSaving ? (
        <>
          <RefreshCw className="w-3 h-3 text-[#7C6CF2] animate-spin shrink-0" />
          <span className="animate-pulse">Sincronizando...</span>
        </>
      ) : (
        <>
          <div className="w-3 h-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Check className="w-2 h-2 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span>Guardado en la nube</span>
        </>
      )}
    </div>
  );
}
