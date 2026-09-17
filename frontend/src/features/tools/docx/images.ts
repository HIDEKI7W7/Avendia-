/**
 * Imágenes incrustadas en los Word: decodificación de los assets base64 y
 * creación de `ImageRun` con tamaño en puntos. Funciona en el navegador y en Node
 * (pruebas) sin descargas externas.
 */
import { ImageRun } from "docx";

import { DOCX_ASSET_DIMENSIONS, DOCX_ASSETS, type DocxAssetKey } from "./assets";

const cache = new Map<DocxAssetKey, Uint8Array>();

export function assetBytes(key: DocxAssetKey): Uint8Array {
  const cached = cache.get(key);
  if (cached) return cached;
  const binary = atob(DOCX_ASSETS[key]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  cache.set(key, bytes);
  return bytes;
}

/** URL `data:` para reutilizar la misma ilustración en la vista previa HTML. */
export function assetDataUrl(key: DocxAssetKey): string {
  return `data:image/jpeg;base64,${DOCX_ASSETS[key]}`;
}

/**
 * Imagen en línea con ancho fijo en píxeles de Word (96 ppp); la altura conserva la
 * proporción original para que nunca se deforme.
 */
export function inlineImage(key: DocxAssetKey, width: number, altText = ""): ImageRun {
  const dims = DOCX_ASSET_DIMENSIONS[key];
  const height = Math.round((width * dims.height) / dims.width);
  return new ImageRun({
    type: "jpg",
    data: assetBytes(key),
    transformation: { width, height },
    altText: { title: altText || key, description: altText || key, name: key },
  });
}

/** Ilustraciones asignadas a cada momento didáctico. */
export function momentAsset(name: string): DocxAssetKey {
  const key = name.toLocaleLowerCase("es");
  if (key.includes("inicio")) return "momento_inicio";
  if (key.includes("cierre")) return "momento_cierre";
  return "momento_desarrollo";
}

/** Ilustraciones de la ficha del estudiante, en rotación. */
export const WORKSHEET_ASSETS: DocxAssetKey[] = ["ficha_1", "ficha_4", "momento_inicio"];
