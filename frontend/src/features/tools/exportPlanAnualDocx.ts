/**
 * Plan Curricular Anual en hoja horizontal con el sistema de diseño compartido:
 * cabecera con logo y lema, portada, índice, datos informativos, síntesis, matrices
 * por familia de color, cuadrícula de periodos y firmas.
 */
import {
  AlignmentType, Document, HeadingLevel, PageBreak, Packer, Paragraph, Table, TableOfContents, TextRun,
} from "docx";

import { isPlaceholder, stripNumbering } from "./documentFormat";
import {
  bandTitle, bodyParagraphs, cell, checkLine, clean, headerCell, keyValueTable, matrixTable, row, run, spacer, subTitle, table,
} from "./docx/blocks";
import { documentFooter, documentHeader, pageProperties, signaturesBlock } from "./docx/chrome";
import { COLORS, CONTENT_WIDTH_LANDSCAPE, FONT_DISPLAY, documentStyles } from "./docx/theme";
import type { WorkflowArtifact, WorkflowArtifactTable } from "./exportWorkflowDocx";

export type ExportPlanAnualContext = {
  workflowKey?: string;
  values?: Record<string, unknown>;
  toolTitle?: string;
  [key: string]: unknown;
};

function safeFileName(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim().replace(/\s+/g, "-").toLowerCase() || "plan-curricular-anual";
}

function value(values: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const raw = values[key];
    const candidate = (Array.isArray(raw) ? raw.join(", ") : String(raw ?? "")).replace(/\*+/g, "").replace(/^#{1,6}\s*/gm, "").trim();
    if (candidate && !isPlaceholder(candidate)) return candidate;
  }
  return "";
}

/** Color de cabecera según la familia de la matriz (diagnóstico, currículo, evaluación, recursos). */
export function matrixFamilyColor(title: string): string {
  const key = stripNumbering(title).toLocaleLowerCase("es");
  if (/diagn|demanda|prioridad/.test(key)) return COLORS.bandTeal;
  if (/evaluaci|retroaliment|escala|progreso/.test(key)) return COLORS.bandNavy;
  if (/recurso|material|referencia|bibliograf|compromiso/.test(key)) return COLORS.bandDeep;
  return COLORS.bandDark;
}

/** Cuadrícula de periodos construida desde la matriz de calendarización (columna por periodo). */
export function periodGrid(tables: WorkflowArtifactTable[]): { periods: string[]; units: Record<string, string[]> } | null {
  const calendar = tables.find((item) => /calendarizaci/i.test(stripNumbering(item.title)));
  if (!calendar || calendar.columns.length < 3) return null;
  const periodIndex = calendar.columns.findIndex((column) => /periodo|bimestre|trimestre/i.test(column));
  const unitIndex = calendar.columns.findIndex((column) => /^unidad/i.test(column.trim()));
  const titleIndex = calendar.columns.findIndex((column) => /t[ií]tulo/i.test(column));
  const durationIndex = calendar.columns.findIndex((column) => /duraci|fecha/i.test(column));
  if (periodIndex < 0) return null;
  const periods: string[] = [];
  const units: Record<string, string[]> = {};
  calendar.rows.forEach((cells) => {
    const period = clean(cells[periodIndex]) || "Periodo";
    if (!units[period]) { units[period] = []; periods.push(period); }
    const label = [unitIndex >= 0 ? clean(cells[unitIndex]) : "", titleIndex >= 0 ? clean(cells[titleIndex]) : ""].filter(Boolean).join(": ");
    const duration = durationIndex >= 0 ? clean(cells[durationIndex]) : "";
    units[period].push([label || clean(cells[1]), duration ? `(${duration})` : ""].filter(Boolean).join(" "));
  });
  return { periods, units };
}

function coverPage(artifact: WorkflowArtifact, values: Record<string, unknown>): Array<Paragraph | Table> {
  const line = (text: string, size = 22, bold = false, color: string = COLORS.text, font?: string) => new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, bold, color, size, font: font ?? "Calibri" })],
    spacing: { after: 120 },
  });
  const rows = ([
    ["Institución educativa", value(values, "institution")],
    ["DRE / UGEL", [value(values, "dre"), value(values, "ugel")].filter(Boolean).join(" / ")],
    ["Nivel y grado", [value(values, "level"), value(values, "grade")].filter(Boolean).join(" · ")],
    ["Áreas curriculares", value(values, "curricular_areas", "curricular_area")],
    ["Docente responsable", value(values, "teacher_name")],
    ["Director(a)", value(values, "director_name")],
    ["Año lectivo", value(values, "school_year")],
  ] as Array<[string, string]>).filter(([, content]) => !isPlaceholder(content));
  return [
    new Paragraph({ spacing: { before: 1600 }, children: [] }),
    line(value(values, "institution") || "Institución educativa", 26, true, COLORS.heading, FONT_DISPLAY),
    bandTitle("Plan Curricular Anual", { align: AlignmentType.CENTER, size: 40, heading: false }),
    spacer(120),
    line(clean(artifact.document_title), 26, true, COLORS.band, FONT_DISPLAY),
    new Paragraph({ spacing: { before: 300 }, children: [] }),
    ...(rows.length ? [keyValueTable(rows, { labelWidth: 30 })] : []),
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    line(`Año lectivo ${value(values, "school_year") || "________"}`, 24, true, COLORS.bandDark),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

export async function buildPlanAnualDocxDocument(
  artifact: WorkflowArtifact,
  context: ExportPlanAnualContext = {},
): Promise<Document> {
  const values = context.values ?? {};
  const year = value(values, "school_year");
  const institution = value(values, "institution");
  const area = value(values, "curricular_areas", "curricular_area");
  const tables = artifact.tables ?? [];
  const totalWidth = CONTENT_WIDTH_LANDSCAPE;
  const information = ([
    ["DRE", value(values, "dre")], ["UGEL", value(values, "ugel")], ["Institución educativa", institution],
    ["Modelo de servicio educativo", value(values, "service_model")], ["Modalidad", value(values, "modality")],
    ["Nivel académico", value(values, "level")], ["Planificación por", value(values, "planning_scope")],
    ["Grado o ciclo", value(values, "grade")], ["Secciones", value(values, "sections", "section")],
    ["Periodo de ejecución", value(values, "execution_period")], ["Año lectivo", year], ["Áreas curriculares", area],
    ["Docente responsable", value(values, "teacher_name")], ["Director(a)", value(values, "director_name")],
    ["Subdirector(a)", value(values, "subdirector_name")], ["Enfoque pedagógico", value(values, "pedagogical_approach")],
    ["Tono de redacción", value(values, "writing_tone")], ["Enfoque de evaluación", value(values, "assessment_approach")],
  ] as Array<[string, string]>).filter(([, content]) => !isPlaceholder(content));
  const signers = [
    { name: value(values, "teacher_name"), role: "Docente responsable" },
    { name: value(values, "director_name"), role: "Director(a)" },
  ];
  const grid = periodGrid(tables);
  const indexEntries = [
    { title: "I. DATOS INFORMATIVOS", level: 1 },
    { title: "II. SÍNTESIS DE LA PLANIFICACIÓN", level: 1 },
    ...artifact.sections.map((section, index) => ({ title: `${index + 1}. ${stripNumbering(clean(section.title))}`, level: 2 })),
    ...(grid ? [{ title: "III. CALENDARIZACIÓN POR PERIODOS", level: 1 }] : []),
    { title: `${grid ? "IV" : "III"}. MATRICES ANUALES`, level: 1 },
    ...tables.map((item, index) => ({ title: `${index + 1}. ${stripNumbering(clean(item.title))}`, level: 2 })),
    { title: `${grid ? "V" : "IV"}. RECOMENDACIONES PARA LA IMPLEMENTACIÓN`, level: 1 },
    { title: `${grid ? "VI" : "V"}. VALIDACIÓN`, level: 1 },
  ];
  const children: Array<Paragraph | Table> = [
    ...coverPage(artifact, values),
    bandTitle("Contenido"),
    new TableOfContents("Contenido", { hyperlink: true, headingStyleRange: "1-2", cachedEntries: indexEntries }),
    new Paragraph({ children: [new PageBreak()] }),
    bandTitle("I. Datos informativos"),
    keyValueTable(information.length ? information : [["Institución educativa", "________________"], ["Docente responsable", "________________"], ["Año lectivo", "________"]], { labelWidth: 26 }),
    bandTitle("II. Síntesis de la planificación"),
    ...bodyParagraphs(artifact.executive_summary, { size: 19 }),
  ];

  artifact.sections.forEach((section, index) => {
    children.push(subTitle(`${index + 1}. ${stripNumbering(section.title)}`));
    children.push(...bodyParagraphs(section.narrative, { size: 19 }));
    section.key_points.forEach((point) => children.push(checkLine(point, { size: 18 })));
  });

  let part = 3;
  if (grid) {
    children.push(bandTitle(`${toRomanLocal(part)}. Calendarización por periodos`, { pageBreakBefore: true }));
    const width = Math.floor(100 / grid.periods.length);
    children.push(table([
      row(grid.periods.map((period) => headerCell(period, { width, fill: COLORS.band })), { header: true }),
      row(grid.periods.map((period) => cell(grid.units[period].map((unit, index) => new Paragraph({
        indent: { left: 160, hanging: 160 },
        spacing: { after: 40 },
        children: [run(`${index + 1}. `, { bold: true, color: COLORS.band, size: 17 }), run(unit, { size: 17 })],
      })), { width, vAlign: "top" }))),
    ], { widths: grid.periods.map(() => width), totalWidth }));
    part += 1;
  }

  children.push(bandTitle(`${toRomanLocal(part)}. Matrices anuales`, { pageBreakBefore: true }));
  if (!tables.length) {
    children.push(new Paragraph({ children: [run("Las matrices deben regenerarse antes de descargar la versión final.", { italics: true, color: COLORS.muted })] }));
  } else {
    tables.forEach((item, index) => {
      children.push(subTitle(`${index + 1}. ${stripNumbering(item.title)}`, matrixFamilyColor(item.title)));
      children.push(matrixTable(item.columns, item.rows.map((cells) => item.columns.map((_, cellIndex) => cells[cellIndex] || "________")), { headerFill: matrixFamilyColor(item.title), size: 16, totalWidth }));
      if (item.note) children.push(new Paragraph({ spacing: { before: 40 }, children: [run(clean(item.note), { italics: true, size: 17, color: COLORS.muted })] }));
      children.push(spacer(100));
    });
  }
  part += 1;

  children.push(bandTitle(`${toRomanLocal(part)}. Recomendaciones para la implementación`));
  artifact.teacher_recommendations.forEach((recommendation) => children.push(new Paragraph({
    numbering: { reference: "recommendations", level: 0 },
    children: [run(clean(recommendation), { size: 19 })],
    spacing: { after: 55 },
  })));
  part += 1;

  children.push(bandTitle(`${toRomanLocal(part)}. Validación`));
  children.push(signaturesBlock(signers));

  return new Document({
    features: { updateFields: true },
    numbering: { config: [{ reference: "recommendations", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT }] }] },
    styles: documentStyles,
    sections: [{
      properties: pageProperties("landscape"),
      headers: documentHeader({ headerRight: [institution, area, year ? `PCA ${year}` : "PCA"].filter(Boolean).join(" · ") }),
      footers: documentFooter(`Plan Curricular Anual · ${clean(artifact.document_title)}`),
      children,
    }],
  });
}

function toRomanLocal(value: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][value - 1] ?? String(value);
}

export { HeadingLevel };

export async function exportPlanAnualDocx(artifact: WorkflowArtifact, context: ExportPlanAnualContext = {}): Promise<Blob> {
  const doc = await buildPlanAnualDocxDocument(artifact, context);
  const blob = await Packer.toBlob(doc);
  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeFileName(artifact.document_title || "plan-curricular-anual")}.docx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return blob;
}
