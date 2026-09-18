/**
 * El borrador de una herramienta: lo que el docente lleva escrito, el resultado
 * generado y de dónde procede cada dato.
 *
 * El tipo y sus invariantes viven aquí, separados de quién lo guarda (navegador
 * o servidor) y de quién lo pinta.
 */
import type { WorkflowArtifact } from "../../exportWorkflowDocx";
import type { DocumentReferenceSelection } from "../../DocumentReferencePanel";
import type { ReferenceSelection } from "../../../../lib/curricularReference";

import { displayValue, type FieldSource, type FieldValue } from "./fieldValue";

export const DRAFT_VERSION = 2;

export type Draft = {
  version: typeof DRAFT_VERSION;
  documentId?: string;
  serverVersion?: number;
  values: Record<string, FieldValue>;
  currentStep: number;
  artifact: WorkflowArtifact | null;
  templateId?: string;
  templateName?: string;
  fieldSources?: Record<string, FieldSource>;
  reference?: DocumentReferenceSelection;
  /** Origen de la secuencia curricular (plan anual o unidad) elegido en cascada. */
  curricular?: ReferenceSelection;
  /** Campos copiados del origen, para poder retirarlos si se cambia o se quita. */
  curricularFields?: string[];
  updatedAt: string;
};

/** Borrador limpio: lo que viene del perfil queda marcado como tal. */
export function emptyDraft(initialValues: Record<string, FieldValue>): Draft {
  return {
    version: DRAFT_VERSION,
    values: initialValues,
    currentStep: 0,
    artifact: null,
    fieldSources: Object.fromEntries(
      Object.entries(initialValues)
        .filter(([, value]) => displayValue(value).trim())
        .map(([id]) => [id, "profile" as const]),
    ),
    updatedAt: "",
  };
}
