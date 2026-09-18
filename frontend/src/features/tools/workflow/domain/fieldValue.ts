/**
 * Valor de un campo del formulario y su representación como texto.
 *
 * Los formularios guardan cadenas o listas de cadenas; la IA y el servidor solo
 * reciben texto. Convertir en un único sitio evita que cada consumidor invente
 * su propia forma de aplanar una lista.
 */
export type FieldValue = string | string[];

export function displayValue(value: FieldValue | undefined): string {
  return Array.isArray(value) ? value.join(", ") : String(value ?? "");
}

export type FieldSource = "teacher" | "ai" | "reference" | "profile";
