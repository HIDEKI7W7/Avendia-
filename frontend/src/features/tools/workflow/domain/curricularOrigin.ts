/**
 * Reglas del origen curricular de un documento: de qué plan anual o unidad
 * procede, qué datos hereda de él y qué ocurre cuando se cambia o desaparece.
 *
 * Estas reglas estaban repartidas dentro del componente y ahí se concentraron
 * cuatro defectos: heredar el nivel sin su modalidad, no soltar lo heredado al
 * cambiar de origen, arrastrar un origen ya borrado y no invalidar el resultado
 * anterior. Aisladas aquí son funciones puras y se pueden probar una a una.
 */
import {
  EMPTY_REFERENCE_SELECTION,
  resolveReference,
  type CurricularReference,
  type ReferenceSelection,
} from "../../../../lib/curricularReference";

import type { FieldSource, FieldValue } from "./fieldValue";

/**
 * Campos que un plan o una unidad puede aportar, en orden de dependencia: la
 * modalidad manda sobre el nivel, y el nivel sobre el grado y el área. Copiar el
 * nivel sin su modalidad deja un nivel fuera de las opciones válidas.
 */
const INHERITABLE: ReadonlyArray<readonly [string, (source: CurricularReference) => string]> = [
  ["modality", (source) => source.modality],
  ["level", (source) => source.level],
  ["grade", (source) => source.grade],
  ["curricular_area", (source) => source.area],
  ["unit_title", (source) => source.unitTitle],
  ["unit_purpose", (source) => source.purpose],
];

/** Valores que el origen aporta, limitados a los campos que la herramienta pide. */
export function inheritedValues(
  source: CurricularReference | null,
  declaredFieldIds: ReadonlySet<string>,
): Record<string, FieldValue> {
  if (!source) return {};
  const values: Record<string, FieldValue> = {};
  for (const [fieldId, read] of INHERITABLE) {
    const value = read(source);
    if (declaredFieldIds.has(fieldId) && value) values[fieldId] = value;
  }
  return values;
}

/**
 * Campos que deben vaciarse al cambiar de origen: los que copió el origen
 * anterior, ya no aporta el nuevo, y el docente no editó después.
 */
export function releasedFields(
  previouslyInherited: readonly string[],
  nextInherited: Record<string, FieldValue>,
  fieldSources: Record<string, FieldSource> = {},
): string[] {
  return previouslyInherited.filter(
    (fieldId) => !(fieldId in nextInherited) && fieldSources[fieldId] === "reference",
  );
}

/**
 * Origen realmente utilizable. Un plan o una unidad que el docente borró sigue
 * en el borrador guardado; enviarlo hace que el servidor responda 404 en cada
 * intento de generar, y el selector se oculta cuando no queda ningún documento,
 * así que no habría forma de corregirlo desde la pantalla.
 *
 * Con `references` a `null` (lista aún no cargada) se respeta lo guardado: no se
 * puede afirmar que un documento no existe sin haberlos pedido.
 */
export function effectiveOrigin(
  chosen: ReferenceSelection | undefined,
  references: readonly CurricularReference[] | null,
): ReferenceSelection {
  const selection = chosen ?? EMPTY_REFERENCE_SELECTION;
  if (!references) return selection;
  const known = (id: string) => !id || references.some((item) => item.id === id);
  return known(selection.planId) && known(selection.unitId) ? selection : EMPTY_REFERENCE_SELECTION;
}

/** Documento del que cuelga el resultado: la unidad si se eligió, si no el plan. */
export function originDocumentId(selection: ReferenceSelection): string {
  return selection.unitId || selection.planId || "";
}

export function originSource(
  selection: ReferenceSelection,
  references: readonly CurricularReference[] | null,
): CurricularReference | null {
  return resolveReference(selection, [...(references ?? [])]);
}
