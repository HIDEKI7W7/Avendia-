/**
 * Adaptador de `DraftStorage` sobre `localStorage`.
 *
 * Conserva el comportamiento anterior: se intenta la clave actual y después la
 * heredada, se normaliza la modalidad guardada contra el catálogo vigente y
 * cualquier borrador ilegible se descarta en silencio en vez de romper la
 * pantalla.
 */
import { workflowModalities } from "../../../../config/workflows";
import { DRAFT_VERSION, emptyDraft, type Draft } from "../domain/draft";
import type { FieldValue } from "../domain/fieldValue";
import type { DraftStorage } from "../ports/draftStorage";

export function localDraftStorage(storageKey: string, legacyStorageKey: string): DraftStorage {
  return {
    read(initialValues) {
      const fallback = emptyDraft(initialValues);
      for (const key of [storageKey, legacyStorageKey]) {
        try {
          const saved = JSON.parse(localStorage.getItem(key) ?? "null") as Partial<Draft> | null;
          if (!saved) continue;
          const values: Record<string, FieldValue> = { ...initialValues, ...saved.values };
          const savedModality = values.modality;
          if (typeof savedModality === "string") {
            values.modality = workflowModalities.find((option) => option.startsWith(savedModality.slice(0, 3))) ?? savedModality;
          }
          return {
            ...fallback,
            ...saved,
            version: DRAFT_VERSION,
            values,
            currentStep: Number(saved.currentStep ?? 0),
            artifact: saved.artifact ?? null,
          };
        } catch {
          // Usa el siguiente borrador disponible o comienza con uno limpio.
        }
      }
      return fallback;
    },
    write(draft) {
      const saved: Draft = { ...draft, version: DRAFT_VERSION, updatedAt: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify(saved));
      return saved;
    },
  };
}
