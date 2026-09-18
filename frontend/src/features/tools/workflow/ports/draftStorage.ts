/**
 * Puerto de persistencia del borrador en el dispositivo.
 *
 * El caso de uso solo necesita leer y escribir; que detrás haya `localStorage`,
 * memoria o cualquier otra cosa es asunto del adaptador. Gracias a esto las
 * pruebas pueden sustituirlo sin tocar `window`.
 */
import type { Draft } from "../domain/draft";
import type { FieldValue } from "../domain/fieldValue";

export type DraftStorage = {
  read(initialValues: Record<string, FieldValue>): Draft;
  write(draft: Draft): Draft;
};
