/**
 * Bloques reutilizables de los Word de Avendia: bandas de título, tablas de datos,
 * matrices, filas etiquetadas, momentos didácticos con ilustración, tarjetas de la
 * ficha del estudiante y mapa mental. Cada bloque crece con el contenido y nunca
 * fija alturas: el documento ocupa las hojas que necesite.
 */
import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

import { splitLabel, splitNarrative } from "../documentFormat";
import { CELL_MARGINS, COLORS, CONTENT_WIDTH_PORTRAIT, FONT_BODY, FONT_DISPLAY, momentColor, noBorder, thinBorder } from "./theme";

export type Align = (typeof AlignmentType)[keyof typeof AlignmentType];

export function clean(value: unknown): string {
  return String(value ?? "").replace(/\*+/g, "").replace(/\s+/g, " ").trim();
}

export function run(text: string, options: { bold?: boolean; italics?: boolean; color?: string; size?: number; font?: string } = {}): TextRun {
  return new TextRun({
    text,
    bold: options.bold,
    italics: options.italics,
    color: options.color ?? COLORS.text,
    size: options.size ?? 20,
    font: options.font ?? FONT_BODY,
  });
}

/** "Etiqueta: contenido" con la etiqueta en negrita y color de acento. */
export function labelRuns(text: string, size = 20, color: string = COLORS.text, accent: string = COLORS.heading): TextRun[] {
  const parts = splitLabel(clean(text));
  if (parts.label) {
    return [run(`${parts.label}: `, { bold: true, size, color: accent }), run(parts.body, { size, color })];
  }
  return [run(clean(text), { size, color })];
}

/** Banda de título a todo el ancho (I. DATOS INFORMATIVOS...). */
export function bandTitle(text: string, options: { color?: string; size?: number; pageBreakBefore?: boolean; align?: Align; heading?: boolean } = {}): Paragraph {
  return new Paragraph({
    heading: options.heading === false ? undefined : HeadingLevel.HEADING_1,
    pageBreakBefore: options.pageBreakBefore,
    keepNext: true,
    alignment: options.align ?? AlignmentType.LEFT,
    shading: { type: ShadingType.CLEAR, fill: options.color ?? COLORS.band, color: "auto" },
    spacing: { before: 200, after: 0 },
    indent: { left: 120, right: 120 },
    children: [new TextRun({ text: clean(text).toLocaleUpperCase("es"), bold: true, color: COLORS.white, size: options.size ?? 22, font: FONT_DISPLAY })],
  });
}

/** Subtítulo de bloque sin banda (Heading 2). */
export function subTitle(text: string, color: string = COLORS.bandDark): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
    spacing: { before: 160, after: 60 },
    children: [run(clean(text), { bold: true, color, size: 21 })],
  });
}

/** Párrafos de cuerpo: respeta saltos y convierte viñetas incrustadas en lista con ✓. */
export function bodyParagraphs(text: string, options: { size?: number; after?: number; justify?: boolean; bulletMark?: string; accent?: string } = {}): Paragraph[] {
  const blocks = splitNarrative(String(text ?? ""));
  return blocks.map((block) =>
    block.bullet
      ? checkLine(block.text, { size: options.size, mark: options.bulletMark, accent: options.accent })
      : new Paragraph({
          alignment: options.justify === false ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
          children: labelRuns(block.text, options.size ?? 20, COLORS.text, options.accent ?? COLORS.heading),
          spacing: { after: options.after ?? 80, line: 264 },
        })
  );
}

/** Línea con marca ✓ (o la indicada) delante, como en el formato de referencia. */
export function checkLine(text: string, options: { size?: number; mark?: string; accent?: string; color?: string } = {}): Paragraph {
  const size = options.size ?? 20;
  return new Paragraph({
    indent: { left: 200, hanging: 200 },
    spacing: { after: 40, line: 264 },
    children: [run(`${options.mark ?? "✓"} `, { bold: true, color: options.accent ?? COLORS.band, size }), ...labelRuns(text, size, options.color ?? COLORS.text, options.accent ?? COLORS.heading)],
  });
}

/** Convierte texto multilínea o con viñetas en párrafos de celda. */
export function cellParagraphs(content: string, options: { bold?: boolean; color?: string; size?: number; align?: Align; check?: boolean; italics?: boolean } = {}): Paragraph[] {
  const raw = String(content ?? "").replace(/\r/g, "").trim();
  const lines = raw.replace(/\s+[•▪●]\s+/g, "\n• ").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [new Paragraph({ children: [run("", { size: options.size ?? 18 })], spacing: { before: 20, after: 20 } })];
  return lines.map((line) => {
    const isBullet = /^([-•▪●✓✔]|\d+[.)])\s+/.test(line);
    const body = line.replace(/^[-•▪●✓✔]\s+/, "");
    const size = options.size ?? 18;
    if ((isBullet || options.check) && lines.length > 0 && !/^\d+[.)]\s+/.test(line)) {
      return new Paragraph({
        alignment: options.align ?? AlignmentType.LEFT,
        indent: { left: 180, hanging: 180 },
        spacing: { before: 10, after: 10, line: 252 },
        children: [run("✓ ", { bold: true, color: options.color ?? COLORS.band, size }), ...labelRuns(body, size, options.color ?? COLORS.text)],
      });
    }
    return new Paragraph({
      alignment: options.align ?? AlignmentType.LEFT,
      spacing: { before: 20, after: 20, line: 252 },
      children: options.bold
        ? [run(clean(line), { bold: true, color: options.color, size, italics: options.italics })]
        : labelRuns(line, size, options.color ?? COLORS.text),
    });
  });
}

export type CellOptions = {
  fill?: string;
  bold?: boolean;
  color?: string;
  size?: number;
  align?: Align;
  width?: number;
  colSpan?: number;
  rowSpan?: number;
  check?: boolean;
  italics?: boolean;
  borderColor?: string;
  vAlign?: "top" | "center" | "bottom";
  margins?: { top: number; bottom: number; left: number; right: number };
  noBorders?: boolean;
};

export function cell(content: string | Paragraph[], options: CellOptions = {}): TableCell {
  const children = Array.isArray(content) ? content : cellParagraphs(content, options);
  return new TableCell({
    columnSpan: options.colSpan,
    rowSpan: options.rowSpan,
    width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    margins: options.margins ?? CELL_MARGINS,
    borders: options.noBorders ? noBorder() : thinBorder(options.borderColor ?? COLORS.border),
    shading: options.fill ? { fill: options.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    verticalAlign: options.vAlign ?? VerticalAlign.CENTER,
    children,
  });
}

/** Celda de cabecera: fondo azul y texto blanco centrado. */
export function headerCell(text: string, options: CellOptions = {}): TableCell {
  return cell(text, { fill: COLORS.bandDark, bold: true, color: COLORS.white, size: 18, align: AlignmentType.CENTER, ...options });
}

/** Celda de etiqueta: fondo claro y texto en negrita. */
export function labelCell(text: string, options: CellOptions = {}): TableCell {
  return cell(text, { fill: COLORS.labelBg, bold: true, color: COLORS.heading, size: 18, ...options });
}

export function table(rows: TableRow[], options: { widths?: number[]; totalWidth?: number } = {}): Table {
  const total = options.totalWidth ?? CONTENT_WIDTH_PORTRAIT;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: options.widths?.map((width) => Math.round((width / 100) * total)),
    rows,
  });
}

export function row(cells: TableCell[], options: { header?: boolean } = {}): TableRow {
  return new TableRow({ cantSplit: true, tableHeader: options.header, children: cells });
}

/** Tabla de datos "Etiqueta | Valor" (DATOS INFORMATIVOS). */
export function keyValueTable(rows: Array<[string, string]>, options: { labelWidth?: number; title?: string; titleColor?: string } = {}): Table {
  const labelWidth = options.labelWidth ?? 32;
  const body = rows.map(([label, value]) =>
    row([
      labelCell(`${label.toLocaleUpperCase("es")}:`, { width: labelWidth }),
      cell(value, { width: 100 - labelWidth, size: 19 }),
    ])
  );
  const head = options.title
    ? [row([cell(options.title, { fill: options.titleColor ?? COLORS.band, bold: true, color: COLORS.white, size: 21, colSpan: 2 })], { header: true })]
    : [];
  return table([...head, ...body], { widths: [labelWidth, 100 - labelWidth] });
}

/** Matriz genérica con cabecera azul y filas alternas. */
export function matrixTable(columns: string[], rows: string[][], options: { widths?: number[]; headerFill?: string; firstColumnBold?: boolean; check?: boolean; size?: number; totalWidth?: number } = {}): Table {
  const widths = options.widths ?? columnWidths(columns, rows);
  const head = row(columns.map((column, index) => headerCell(column, { width: widths[index], fill: options.headerFill })), { header: true });
  const body = rows.map((cells, rowIndex) =>
    row(
      cells.map((value, index) =>
        cell(value, {
          width: widths[index],
          size: options.size ?? 18,
          bold: options.firstColumnBold !== false && index === 0 && clean(value).length <= 48 ? true : undefined,
          fill: rowIndex % 2 ? COLORS.softBg : undefined,
          check: options.check,
        })
      )
    )
  );
  return table([head, ...body], { widths, totalWidth: options.totalWidth });
}

/** Anchos proporcionales al contenido con mínimo legible. */
export function columnWidths(columns: string[], rows: string[][]): number[] {
  const count = Math.max(1, columns.length);
  const weights = columns.map((column, index) => {
    const cells = rows.map((cells) => String(cells[index] ?? ""));
    const average = cells.reduce((sum, value) => sum + value.length, 0) / Math.max(1, cells.length);
    return Math.max(column.length * 0.8, average, 6);
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const minimum = Math.min(12, Math.floor(60 / count));
  const raw = weights.map((weight) => Math.max(minimum, (weight / total) * 100));
  const rawTotal = raw.reduce((sum, weight) => sum + weight, 0);
  const widths = raw.map((weight) => Math.round((weight / rawTotal) * 100));
  widths[widths.length - 1] += 100 - widths.reduce((sum, weight) => sum + weight, 0);
  return widths;
}

export type LabeledRow = { label: string; text: string; color?: string; check?: boolean; fill?: string };

/** Filas "ETIQUETA | contenido" con etiqueta en banda de color (enfoques, DUA, necesidades). */
export function labeledRowsTable(rows: LabeledRow[], options: { labelWidth?: number; title?: string; titleColor?: string } = {}): Table {
  const labelWidth = options.labelWidth ?? 28;
  const head = options.title
    ? [row([cell(options.title, { fill: options.titleColor ?? COLORS.band, bold: true, color: COLORS.white, size: 21, colSpan: 2 })], { header: true })]
    : [];
  const body = rows.map((item) =>
    row([
      cell(item.label.toLocaleUpperCase("es"), { fill: item.color ?? COLORS.bandTeal, bold: true, color: COLORS.white, size: 17, width: labelWidth, align: AlignmentType.CENTER }),
      cell(item.text, { width: 100 - labelWidth, size: 18, check: item.check, fill: item.fill }),
    ])
  );
  return table([...head, ...body], { widths: [labelWidth, 100 - labelWidth] });
}

export type Moment = { name: string; minutes?: string; text: string };

/**
 * VI. Procesos pedagógicos: una fila por momento con su banda de color.
 *
 * Sin ilustraciones: el documento solo contiene lo que se genera a partir de los
 * datos del docente, no imágenes decorativas ajenas al tema de la sesión.
 */
export function momentsTable(moments: Moment[], options: { title?: string } = {}): Table {
  const head = options.title
    ? [row([cell(options.title, { fill: COLORS.band, bold: true, color: COLORS.white, size: 21, colSpan: 2 })], { header: true })]
    : [];
  const body = moments.map((moment) => {
    const accent = momentColor(moment.name);
    const label = cell([
      new Paragraph({ alignment: AlignmentType.CENTER, children: [run(moment.name.toLocaleUpperCase("es"), { bold: true, color: COLORS.white, size: 19 })], spacing: { after: 20 } }),
      ...(moment.minutes ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(moment.minutes, { color: COLORS.white, size: 16 })] })] : []),
    ], { fill: accent, width: 14, borderColor: accent });
    const content = cell(cellParagraphs(moment.text, { size: 18 }), { width: 86 });
    // Las filas pueden partirse entre páginas: un momento largo no debe dejar media hoja en blanco.
    return new TableRow({ cantSplit: false, children: [label, content] });
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [...head, ...body],
  });
}

/** Tarjeta con borde de color para consignas de la ficha. */
export function card(paragraphs: Paragraph[], options: { color?: string; fill?: string } = {}): Table {
  const color = options.color ?? COLORS.borderSoft;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color },
              bottom: { style: BorderStyle.SINGLE, size: 6, color },
              right: { style: BorderStyle.SINGLE, size: 6, color },
              left: { style: BorderStyle.SINGLE, size: 24, color },
            },
            shading: options.fill ? { fill: options.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: paragraphs,
          }),
        ],
      }),
    ],
  });
}

/** Líneas de respuesta para desarrollo. */
export function answerLines(count: number): Paragraph[] {
  return Array.from({ length: count }, () => new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [run("_______________________________________________________________________________", { color: COLORS.lines, size: 18 })],
  }));
}

/** Recuadro vacío para dibujar o elaborar un organizador. */
export function drawingBox(lines = 10): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: thinBorder(COLORS.borderSoft, 8),
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: Array.from({ length: lines }, () => new Paragraph({ children: [run(" ")], spacing: { after: 120 } })),
          }),
        ],
      }),
    ],
  });
}

/** Autoevaluación "Lo logré / En proceso / Necesito ayuda". */
export function selfAssessmentTable(items: string[]): Table {
  const widths = [55, 15, 15, 15];
  const head = row([
    headerCell("Lo que aprendí a hacer", { width: widths[0], fill: COLORS.bandNavy }),
    headerCell("Lo logré", { width: widths[1], fill: COLORS.inicio }),
    headerCell("En proceso", { width: widths[2], fill: COLORS.desarrollo }),
    headerCell("Necesito ayuda", { width: widths[3], fill: COLORS.cierre }),
  ], { header: true });
  const body = items.map((item) => row([
    cell(item, { width: widths[0], size: 18 }),
    cell("", { width: widths[1] }),
    cell("", { width: widths[2] }),
    cell("", { width: widths[3] }),
  ]));
  return table([head, ...body], { widths });
}

export type MindBranch = { title: string; items: string[] };

/** Mapa mental: nodo central y ramas en cajas de color. */
export function mindMap(center: string, branches: MindBranch[]): (Paragraph | Table)[] {
  const palette = [COLORS.inicio, COLORS.desarrollo, COLORS.cierre, COLORS.teal, COLORS.bandDark, COLORS.bandTeal];
  const blocks: (Paragraph | Table)[] = [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: noBorder(),
              shading: { fill: COLORS.bandDeep, type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 140, bottom: 140, left: 200, right: 200 },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(clean(center).toLocaleUpperCase("es"), { bold: true, color: COLORS.white, size: 24, font: FONT_DISPLAY })] })],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [run("▼", { color: COLORS.bandDeep, size: 26 })], spacing: { before: 60, after: 60 } }),
  ];
  const perRow = branches.length <= 4 ? Math.max(1, branches.length) : 3;
  for (let start = 0; start < branches.length; start += perRow) {
    const slice = branches.slice(start, start + perRow);
    const width = Math.floor(100 / perRow);
    blocks.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { ...noBorder(), insideHorizontal: { style: BorderStyle.NONE, size: 0, color: COLORS.white }, insideVertical: { style: BorderStyle.NONE, size: 0, color: COLORS.white } },
        rows: [
          new TableRow({
            cantSplit: true,
            children: slice.map((branch, index) => {
              const color = palette[(start + index) % palette.length];
              return new TableCell({
                width: { size: width, type: WidthType.PERCENTAGE },
                borders: noBorder(),
                margins: { top: 60, bottom: 60, left: 60, right: 60 },
                verticalAlign: VerticalAlign.TOP,
                children: [
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                      new TableRow({ children: [new TableCell({ borders: thinBorder(color, 8), shading: { fill: color, type: ShadingType.CLEAR, color: "auto" }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(clean(branch.title), { bold: true, color: COLORS.white, size: 18 })] })] })] }),
                      new TableRow({ children: [new TableCell({ borders: thinBorder(color, 8), margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: branch.items.length ? branch.items.map((item) => new Paragraph({ indent: { left: 160, hanging: 160 }, spacing: { after: 30 }, children: [run("• ", { bold: true, color, size: 17 }), run(clean(item), { size: 17 })] })) : [new Paragraph({ children: [run(" ")] })] })] }),
                    ],
                  }),
                ],
              });
            }),
          }),
        ],
      })
    );
  }
  return blocks;
}

export function spacer(after = 120): Paragraph {
  return new Paragraph({ children: [], spacing: { after } });
}
