/**
 * Reglas de validación de un campo del formulario.
 *
 * Son funciones puras: reciben el campo, su valor y las opciones vigentes, y
 * devuelven el mensaje para el docente. No conocen React ni el servidor, de modo
 * que la misma regla vale para pintar el error, para decidir si se puede avanzar
 * de paso y para bloquear la generación.
 */
import { getDynamicEducationOptions } from "../../../../config/education";
import type { WorkflowField } from "../../../../config/workflows";

import { displayValue, type FieldValue } from "./fieldValue";

export function requiredIsMissing(field: WorkflowField, value: FieldValue | undefined): boolean {
  if (!field.required) return false;
  if (Array.isArray(value)) return !value.some((item) => item.trim());
  return !String(value ?? "").trim();
}

/** Opciones vigentes de un campo, resolviendo las que dependen de otro campo. */
export function resolvedFieldOptions(field: WorkflowField, values: Record<string, FieldValue>): string[] {
  if (!field.dynamicOptions) return field.options ?? [];
  return getDynamicEducationOptions(field.dynamicOptions, displayValue(values[field.dependsOn ?? ""]));
}

export function fieldError(field: WorkflowField, value: FieldValue | undefined, options: string[] = []): string {
  if (requiredIsMissing(field, value)) return "Completa este campo para continuar.";
  if (field.type === "repeater" && field.minItems) {
    const completedItems = Array.isArray(value) ? value.filter((item) => item.trim()).length : 0;
    if (completedItems < field.minItems) return `Añade al menos ${field.minItems} ${field.minItems === 1 ? "elemento" : "elementos"}.`;
  }
  if (field.type === "select" && String(value ?? "").trim() && options.length && !options.includes(String(value))) {
    return "Selecciona una opción válida para el contexto elegido.";
  }
  if (field.type === "multiselect" && Array.isArray(value) && options.length && value.some((item) => !options.includes(item))) {
    return "Revisa las opciones: alguna ya no corresponde al contexto elegido.";
  }
  if (field.type === "number" && String(value ?? "").trim()) {
    const numericValue = Number(value);
    if (field.min !== undefined && numericValue < field.min) return `El valor mínimo es ${field.min}.`;
    if (field.max !== undefined && numericValue > field.max) return `El valor máximo es ${field.max}.`;
  }
  return "";
}

/** Campos de la lista que hoy impiden continuar. */
export function invalidFields(fields: WorkflowField[], values: Record<string, FieldValue>): WorkflowField[] {
  return fields.filter((field) => fieldError(field, values[field.id], resolvedFieldOptions(field, values)));
}
