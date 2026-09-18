/**
 * Sistema de diseño de los Word de Avendia.
 *
 * Paleta y tipografía tomadas del formato de sesión de referencia del docente:
 * cabeceras de bloque en azul intenso, bandas claras para etiquetas, acentos por
 * momento didáctico y Calibri como cuerpo. Todos los exportadores y las vistas
 * previas leen estos valores para que lo que se ve coincida con lo que se descarga.
 */
import { BorderStyle } from "docx";

export const FONT_BODY = "Calibri";
export const FONT_DISPLAY = "Bahnschrift SemiBold";
export const FONT_DISPLAY_FALLBACK = "Calibri";

export const COLORS = {
  /** Azul intenso de las cabeceras de bloque (I. DATOS INFORMATIVOS, VI. PROCESOS...). */
  band: "2D7DD2",
  /** Azul medio para cabeceras de tabla y subcabeceras. */
  bandDark: "2E75B6",
  /** Azul petróleo de los anexos (teoría, instrumento). */
  bandDeep: "0F4761",
  /** Azul verdoso para subcabeceras (DUA, enfoques). */
  bandTeal: "0B769F",
  /** Azul marino de las bandas de la ficha. */
  bandNavy: "1B4F72",
  /** Fondo de etiquetas de la tabla de datos. */
  labelBg: "DAE9F7",
  /** Fondo de filas alternas y celdas de contenido resaltado. */
  softBg: "EBF5FB",
  /** Fondo cálido de la ficha del estudiante. */
  warmBg: "FFF7EC",
  warmBorder: "F6C5AC",
  /** Fila del estándar del ciclo (amarillo de la referencia). */
  standardBg: "FFF3B0",
  /** Fila del producto (verde claro de la referencia). */
  productBg: "E3F4E1",
  /** Filas DUA (salmón de la referencia). */
  duaBg: "FBE3D5",
  /** Acentos por momento didáctico. */
  inicio: "3FA34D",
  desarrollo: "EE964B",
  cierre: "7B6CD9",
  teal: "17A398",
  /** Bordes y texto. */
  border: "B8C4D0",
  borderSoft: "85C1E9",
  text: "1F2937",
  muted: "6B7785",
  lines: "94A3B8",
  white: "FFFFFF",
  heading: "1F4D78",
} as const;

/** Colores heredados por los exportadores existentes, ahora resueltos desde la paleta común. */
export const COLOR_PRIMARY: string = COLORS.heading;
export const COLOR_SECONDARY: string = COLORS.bandDark;
export const COLOR_HEADER_BG: string = COLORS.labelBg;
export const COLOR_ZEBRA_BG: string = COLORS.softBg;
export const COLOR_BORDER: string = COLORS.border;
export const COLOR_TEXT: string = COLORS.text;
export const COLOR_MUTED: string = COLORS.muted;

/** A4 vertical: 11906 × 16838 twips. Márgenes de la referencia (2,5 cm / 3 cm). */
export const PAGE_A4 = { width: 11906, height: 16838 } as const;
export const MARGINS_PORTRAIT = { top: 1000, bottom: 900, left: 1134, right: 1134, header: 420, footer: 420 } as const;
export const MARGINS_LANDSCAPE = { top: 720, bottom: 720, left: 1080, right: 1080, header: 360, footer: 360 } as const;
/** Ancho útil (twips) en vertical, para calcular columnas. */
export const CONTENT_WIDTH_PORTRAIT = PAGE_A4.width - MARGINS_PORTRAIT.left - MARGINS_PORTRAIT.right;
export const CONTENT_WIDTH_LANDSCAPE = PAGE_A4.height - MARGINS_LANDSCAPE.left - MARGINS_LANDSCAPE.right;

/** Lema oficial del año; el formato institucional puede sobrescribirlo. */
export const YEAR_MOTTO = "“Año de la Esperanza y el Fortalecimiento de la Democracia”";

export const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 } as const;

export function thinBorder(color: string = COLORS.border, size = 4) {
  const border = { style: BorderStyle.SINGLE, size, color };
  return { top: border, bottom: border, left: border, right: border };
}

export function noBorder() {
  const border = { style: BorderStyle.NONE, size: 0, color: COLORS.white };
  return { top: border, bottom: border, left: border, right: border };
}

/** Color de acento por momento didáctico. */
export function momentColor(name: string): string {
  const key = name.toLocaleLowerCase("es");
  if (key.includes("inicio")) return COLORS.inicio;
  if (key.includes("cierre")) return COLORS.cierre;
  return COLORS.desarrollo;
}

/** Estilos de párrafo de Word compartidos por todos los documentos. */
export const documentStyles = {
  default: {
    document: { run: { font: FONT_BODY, size: 21, color: COLORS.text } },
  },
  paragraphStyles: [
    {
      id: "Heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: FONT_BODY, size: 24, bold: true, color: COLORS.heading },
      paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, outlineLevel: 0 },
    },
    {
      id: "Heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: FONT_BODY, size: 22, bold: true, color: COLORS.bandDark },
      paragraph: { spacing: { before: 180, after: 80 }, keepNext: true, outlineLevel: 1 },
    },
    {
      id: "Heading3",
      name: "Heading 3",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: FONT_BODY, size: 21, bold: true, color: COLORS.heading },
      paragraph: { spacing: { before: 140, after: 60 }, keepNext: true, outlineLevel: 2 },
    },
    {
      id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal",
      run: { font: FONT_BODY, size: 20, bold: true, color: COLORS.heading },
      paragraph: { spacing: { before: 60, after: 40 } },
    },
    {
      id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal",
      run: { font: FONT_BODY, size: 19, color: COLORS.text },
      paragraph: { spacing: { after: 30 }, indent: { left: 360 } },
    },
  ],
};
