import { useSyncExternalStore } from "react";

import { YEAR_MOTTO } from "./theme";

/**
 * Lema del año que encabeza todos los Word y sus vistas previas.
 * Administración lo fija en la plataforma; la aplicación lo carga al iniciar
 * sesión y, mientras tanto, usa el lema del año en curso incrustado.
 */
let currentMotto = YEAR_MOTTO;
const listeners = new Set<() => void>();

export function getYearMotto(): string {
  return currentMotto;
}

/** Fija el lema; una cadena vacía indica que la cabecera no lo imprime. */
export function setYearMotto(motto: string | null | undefined): void {
  const next = typeof motto === "string" ? motto.trim() : YEAR_MOTTO;
  if (next === currentMotto) return;
  currentMotto = next;
  listeners.forEach((listener) => listener());
}

/** Vuelve al lema incrustado (al cerrar sesión o en pruebas). */
export function resetYearMotto(): void {
  setYearMotto(YEAR_MOTTO);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useYearMotto(): string {
  return useSyncExternalStore(subscribe, getYearMotto, getYearMotto);
}

/** Interpreta la respuesta de `/dashboard/branding` sin confiar en su forma. */
export function applyBrandingResponse(payload: unknown): void {
  if (payload && typeof payload === "object" && "year_motto" in payload) {
    const value = (payload as { year_motto?: unknown }).year_motto;
    if (typeof value === "string") setYearMotto(value);
  }
}
