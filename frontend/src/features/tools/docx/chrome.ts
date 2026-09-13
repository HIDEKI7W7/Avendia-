/**
 * Cabecera, pie, propiedades de página y bloque de firmas compartidos por todos los
 * Word de Avendia. Reproduce el "chrome" del formato de referencia: logo del
 * Ministerio y lema del año arriba, numeración y datos del documento abajo,
 * líneas de firma centradas al final.
 */
import {
  AlignmentType,
  BorderStyle,
  Footer,
  Header,
  PageNumber,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { inlineImage } from "./images";
import {
  COLORS,
  FONT_BODY,
  MARGINS_LANDSCAPE,
  MARGINS_PORTRAIT,
  PAGE_A4,
  YEAR_MOTTO,
  noBorder,
} from "./theme";

export type PageMode = "portrait" | "landscape";

/** Tamaño A4 y márgenes homogéneos; docx recibe siempre el A4 vertical y rota si hace falta. */
export function pageProperties(mode: PageMode = "portrait") {
  const landscape = mode === "landscape";
  return {
    page: {
      size: {
        orientation: landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
        width: PAGE_A4.width,
        height: PAGE_A4.height,
      },
      margin: landscape ? { ...MARGINS_LANDSCAPE } : { ...MARGINS_PORTRAIT },
    },
  };
}

export type ChromeOptions = {
  /** Lema del año; si es cadena vacía no se imprime. */
  motto?: string;
  /** Texto pequeño a la derecha de la cabecera (p. ej. "I.E. 123 · Personal Social"). */
  headerRight?: string;
  /** Muestra el logo del Ministerio en la cabecera (por defecto sí). */
  withLogo?: boolean;
};

function tiny(text: string, options: { bold?: boolean; italics?: boolean; color?: string } = {}) {
  return new TextRun({ text, size: 15, color: options.color ?? COLORS.muted, bold: options.bold, italics: options.italics, font: FONT_BODY });
}

/** Cabecera con logo institucional a la izquierda y lema del año a la derecha. */
export function documentHeader(options: ChromeOptions = {}) {
  const motto = options.motto ?? YEAR_MOTTO;
  const withLogo = options.withLogo ?? true;
  const rightLines: Paragraph[] = [];
  if (motto) {
    rightLines.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [tiny(motto, { italics: true, color: COLORS.heading })], spacing: { after: 0 } }));
  }
  if (options.headerRight) {
    rightLines.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [tiny(options.headerRight)], spacing: { after: 0 } }));
  }
  if (!rightLines.length) rightLines.push(new Paragraph({ children: [] }));

  const rule = { style: BorderStyle.SINGLE, size: 6, color: COLORS.borderSoft, space: 3 };
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { ...noBorder(), insideHorizontal: { style: BorderStyle.NONE, size: 0, color: COLORS.white }, insideVertical: { style: BorderStyle.NONE, size: 0, color: COLORS.white } },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 48, type: WidthType.PERCENTAGE },
            borders: noBorder(),
            margins: { top: 0, bottom: 40, left: 0, right: 0 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: withLogo ? [inlineImage("minedu", 250, "Ministerio de Educación del Perú")] : [tiny("")],
                spacing: { after: 0 },
              }),
            ],
          }),
          new TableCell({
            width: { size: 52, type: WidthType.PERCENTAGE },
            borders: noBorder(),
            margins: { top: 0, bottom: 40, left: 0, right: 0 },
            verticalAlign: "center",
            children: rightLines,
          }),
        ],
      }),
    ],
  });
  return {
    default: new Header({
      children: [
        table,
        new Paragraph({ border: { bottom: rule }, children: [], spacing: { before: 0, after: 80 } }),
      ],
    }),
  };
}

/** Pie con identificación del documento a la izquierda y "Página X de Y" a la derecha. */
export function documentFooter(leftText = "") {
  const runs: TextRun[] = [];
  if (leftText) runs.push(tiny(leftText));
  return {
    default: new Footer({
      children: [
        new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.borderSoft, space: 3 } },
          tabStops: [{ type: "right", position: 9600 }],
          children: [
            ...runs,
            new TextRun({ text: "\tPágina ", size: 15, color: COLORS.muted, font: FONT_BODY }),
            new TextRun({ children: [PageNumber.CURRENT], size: 15, color: COLORS.muted, font: FONT_BODY }),
            new TextRun({ text: " de ", size: 15, color: COLORS.muted, font: FONT_BODY }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: COLORS.muted, font: FONT_BODY }),
          ],
        }),
      ],
    }),
  };
}

export type Signer = { name: string; role: string };

/** Líneas de firma centradas, hasta tres personas en una fila. */
export function signaturesBlock(signers: Signer[]): Table {
  const people = signers.length ? signers.slice(0, 3) : [{ name: "", role: "DOCENTE DEL ÁREA" }, { name: "", role: "DIRECTOR/COORDINADOR" }];
  const width = Math.floor(100 / people.length);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { ...noBorder(), insideHorizontal: { style: BorderStyle.NONE, size: 0, color: COLORS.white }, insideVertical: { style: BorderStyle.NONE, size: 0, color: COLORS.white } },
    rows: [
      new TableRow({
        cantSplit: true,
        children: people.map(
          (person) =>
            new TableCell({
              width: { size: width, type: WidthType.PERCENTAGE },
              borders: noBorder(),
              margins: { top: 480, bottom: 60, left: 120, right: 120 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "_____________________________", color: COLORS.text, size: 20, font: FONT_BODY })],
                  spacing: { after: 30 },
                }),
                ...(person.name
                  ? [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: person.name, bold: true, color: COLORS.heading, size: 19, font: FONT_BODY })],
                        spacing: { after: 10 },
                      }),
                    ]
                  : []),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: person.role.toLocaleUpperCase("es"), bold: true, color: COLORS.text, size: 17, font: FONT_BODY })],
                }),
              ],
            })
        ),
      }),
    ],
  });
}
