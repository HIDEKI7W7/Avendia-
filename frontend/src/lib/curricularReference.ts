/**
 * Documentos de referencia de la secuencia curricular (plan anual y unidad de
 * aprendizaje) que cualquier herramienta puede reutilizar como origen.
 *
 * La cadena pedagógica es Plan curricular anual → Unidad de aprendizaje →
 * Sesión / instrumento / material. El vínculo real entre un plan y sus unidades
 * vive en `document_relations`, por lo que la cascada se resuelve pidiendo las
 * relaciones del plan elegido y no adivinando por coincidencia de campos.
 */

export type ReferenceKind = "plan-curricular-anual" | "unidad-aprendizaje";

export type CurricularReference = {
  id: string;
  kind: ReferenceKind;
  /** Título del documento tal como se guardó en el historial. */
  title: string;
  /** Título pedagógico (campo `unit_title` del formulario) cuando existe. */
  unitTitle: string;
  purpose: string;
  /** Modalidad del origen: manda sobre el nivel en la cascada del formulario. */
  modality: string;
  level: string;
  grade: string;
  area: string;
};

/** Origen elegido por el docente: nada, un plan anual o una unidad. */
export type ReferenceMode = "" | "plan" | "unidad";

export type ReferenceSelection = {
  mode: ReferenceMode;
  /** Plan anual elegido, o el plan que filtra la lista de unidades en cascada. */
  planId: string;
  unitId: string;
};

export const EMPTY_REFERENCE_SELECTION: ReferenceSelection = { mode: "", planId: "", unitId: "" };

export type ReferenceDocument = {
  id: string;
  title: string;
  document_type: string;
  status?: string;
  metadata_json?: Record<string, unknown>;
};

export type ReferenceRelation = {
  parent_document_id: string;
  child_document_id: string;
  relation_type: string;
};

function textField(record: Record<string, unknown> | undefined, key: string): string {
  const value = record?.[key];
  if (typeof value === "string") return value;
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join(", ") : "";
}

function narrativeOf(metadata: Record<string, unknown>, pattern: RegExp): string {
  const artifact = metadata.artifact;
  if (!artifact || typeof artifact !== "object") return "";
  const sections = (artifact as { sections?: Array<{ title?: string; narrative?: string }> }).sections;
  if (!Array.isArray(sections)) return "";
  const match = sections.find((section) => typeof section?.title === "string" && pattern.test(section.title));
  return typeof match?.narrative === "string" ? match.narrative : "";
}

/** Último segmento de un `document_type` con forma `modulo/herramienta`. */
function toolOf(documentType: string): string {
  return documentType.split("/").at(-1) ?? documentType;
}

function kindOf(documentType: string): ReferenceKind | null {
  const tool = toolOf(documentType);
  if (tool === "plan-curricular-anual") return "plan-curricular-anual";
  if (tool === "unidad-aprendizaje") return "unidad-aprendizaje";
  return null;
}

/** Planes anuales y unidades guardados, listos para el selector en cascada. */
export function referencesFromDocuments(documents: ReferenceDocument[]): CurricularReference[] {
  const references: CurricularReference[] = [];
  if (!Array.isArray(documents)) return references;
  for (const document of documents) {
    const kind = kindOf(document.document_type);
    if (!kind || document.status === "archived" || document.status === "trashed") continue;
    const metadata = document.metadata_json ?? {};
    const fields = metadata.fields && typeof metadata.fields === "object"
      ? metadata.fields as Record<string, unknown>
      : undefined;
    const purpose = textField(fields, "learning_purposes")
      || narrativeOf(metadata, /prop[oó]sitos? de aprendizaje/i)
      || textField(fields, "significant_situation")
      || narrativeOf(metadata, /situaci[oó]n significativa/i);
    references.push({
      id: document.id,
      kind,
      title: document.title,
      unitTitle: textField(fields, "unit_title") || document.title,
      purpose,
      modality: textField(fields, "modality"),
      level: textField(fields, "level"),
      grade: textField(fields, "grade"),
      area: textField(fields, "curricular_area"),
    });
  }
  return references;
}

/** Texto corto para el `<option>`: título más área y grado cuando se conocen. */
export function referenceLabel(reference: CurricularReference): string {
  const details = [reference.area, reference.grade].filter(Boolean).join(" · ");
  return details ? `${reference.title} · ${details}` : reference.title;
}

/**
 * Documento que finalmente hereda la herramienta: la unidad si el docente eligió
 * una, el plan anual si se quedó en ese nivel, o nada.
 */
export function resolveReference(
  selection: ReferenceSelection,
  references: CurricularReference[],
): CurricularReference | null {
  if (selection.mode === "unidad" && selection.unitId) {
    return references.find((reference) => reference.id === selection.unitId) ?? null;
  }
  if (selection.mode === "plan" && selection.planId) {
    return references.find((reference) => reference.id === selection.planId) ?? null;
  }
  return null;
}
