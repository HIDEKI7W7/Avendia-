/**
 * Word de la Sesión de Aprendizaje con el formato de referencia del docente:
 * bloques I–VIII con bandas de color, ilustraciones por momento, firmas y anexos
 * (teoría del tema, instrumento, ficha de trabajo y mapa mental). El contenido
 * crece libremente: el documento ocupa las hojas que necesite.
 */
import { AlignmentType, Document, Paragraph, Table, TextRun, VerticalAlign } from "docx";

import type { WorkflowArtifact } from "../exportWorkflowDocx";
import {
  answerLines,
  bandTitle,
  bodyParagraphs,
  card,
  cell,
  cellParagraphs,
  checkLine,
  clean,
  drawingBox,
  headerCell,
  keyValueTable,
  labelCell,
  labeledRowsTable,
  mindMap,
  momentsTable,
  row,
  run,
  selfAssessmentTable,
  spacer,
  subTitle,
  table,
} from "./blocks";
import { documentFooter, documentHeader, pageProperties, signaturesBlock } from "./chrome";
import { inlineImage, WORKSHEET_ASSETS } from "./images";
import { readSessionContent, type SessionContent, type SessionMoment } from "./sessionContent";
import { COLORS, FONT_DISPLAY, documentStyles } from "./theme";

type Block = Paragraph | Table;

/** Título "SESIÓN DE APRENDIZAJE N° 04" + título entre comillas. */
function titleBlocks(content: SessionContent): Paragraph[] {
  const number = content.sessionNumber ? `N° ${content.sessionNumber.padStart(2, "0")}` : "N° ____";
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: `SESIÓN DE APRENDIZAJE ${number}`, bold: true, color: COLORS.heading, size: 30, font: FONT_DISPLAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: `“${clean(content.title).toLocaleUpperCase("es")}”`, bold: true, color: COLORS.band, size: 24, font: FONT_DISPLAY })],
    }),
  ];
}

/** Texto de un momento: procesos del docente, acciones del estudiante y evidencia. */
function momentText(moment: SessionMoment): string {
  const parts: string[] = [];
  if (moment.teacher) parts.push(moment.teacher);
  if (moment.student && moment.student.trim() !== moment.teacher.trim()) parts.push(`Acciones del estudiante: ${moment.student}`);
  if (moment.evidence) parts.push(`Evidencia y retroalimentación: ${moment.evidence}`);
  return parts.join("\n");
}

function purposesTable(content: SessionContent): Table {
  const widths = [36, 32, 32];
  const rows = [
    row([headerCell("Competencia principal y capacidades", { width: widths[0] }), headerCell("Desempeños del grado", { width: widths[1] }), headerCell("Criterios de evaluación", { width: widths[2] })], { header: true }),
  ];
  content.competencies.forEach((item, index) => {
    if (index === 1) {
      rows.push(row([headerCell("Competencia de apoyo", { width: widths[0], fill: COLORS.bandTeal }), headerCell("Capacidades / desempeños", { width: widths[1], fill: COLORS.bandTeal }), headerCell("Criterios", { width: widths[2], fill: COLORS.bandTeal })]));
    }
    rows.push(row([
      cell(item.competency || "________________", { width: widths[0], check: true }),
      cell(item.performances || "________________", { width: widths[1], check: true }),
      cell(item.criteria || "________________", { width: widths[2], check: true }),
    ]));
  });
  if (content.alignment.standard) {
    rows.push(row([
      labelCell("Estándar del ciclo\n(lo que se espera al final del ciclo)", { width: widths[0], align: AlignmentType.CENTER }),
      cell(content.alignment.standard, { width: 64, colSpan: 2, size: 17, italics: true }),
    ]));
  }
  return table(rows, { widths });
}

function alignmentTable(content: SessionContent): Table {
  const widths = [34, 36, 30];
  const rows = [
    row([headerCell("Propósito", { width: widths[0] }), headerCell("Reto y situación significativa", { width: widths[1] }), headerCell("Evidencia", { width: widths[2] })], { header: true }),
    row([
      cell(content.alignment.purpose || "¿Qué?\n¿Cómo?\n¿Para qué?", { width: widths[0] }),
      cell(content.alignment.challenge || "________________", { width: widths[1] }),
      cell(content.alignment.evidence || "________________", { width: widths[2] }),
    ]),
    row([
      labelCell("Producto", { width: widths[0], align: AlignmentType.CENTER }),
      cell(content.alignment.product || content.alignment.evidence || "________________", { width: 66, colSpan: 2, bold: true }),
    ]),
  ];
  return table(rows, { widths });
}

function evaluationTable(content: SessionContent): Table {
  const widths = [40, 30, 30];
  const rows = [
    row([headerCell("Criterios de evaluación", { width: widths[0], fill: COLORS.bandNavy }), headerCell("Evidencia", { width: widths[1], fill: COLORS.bandNavy }), headerCell("Instrumento", { width: widths[2], fill: COLORS.bandNavy })], { header: true }),
    ...content.criteria.slice(0, 6).map((item) => row([
      cell(item.criterion, { width: widths[0], check: true }),
      cell(item.evidence || content.alignment.evidence || "", { width: widths[1] }),
      cell(content.instrument, { width: widths[2], align: AlignmentType.CENTER }),
    ])),
  ];
  if (content.feedback) {
    rows.push(row([labelCell("Retroalimentación", { width: widths[0], align: AlignmentType.CENTER }), cell(content.feedback, { width: 60, colSpan: 2 })]));
  }
  return table(rows, { widths });
}

function sourcesTable(content: SessionContent): Table {
  const widths = [34, 33, 33];
  return table([
    row([headerCell("Referencias", { width: widths[0] }), headerCell("Recursos", { width: widths[1] }), headerCell("Materiales", { width: widths[2] })], { header: true }),
    row([
      cell(content.sources.references || " ", { width: widths[0], size: 17 }),
      cell(content.sources.resources || " ", { width: widths[1], size: 17 }),
      cell(content.sources.materials || " ", { width: widths[2], size: 17 }),
    ]),
  ], { widths });
}

function observationGuide(content: SessionContent): Block[] {
  const criteria = content.criteria.slice(0, 5);
  const criterionWidth = criteria.length ? Math.floor(52 / criteria.length) : 52;
  const widths = [6, 26, ...criteria.map(() => criterionWidth), 100 - 6 - 26 - criterionWidth * criteria.length];
  const students = content.students.length ? content.students : Array.from({ length: 10 }, () => "");
  const head = row([
    headerCell("N°", { width: widths[0], fill: COLORS.bandDeep }),
    headerCell("Nombres y apellidos", { width: widths[1], fill: COLORS.bandDeep }),
    ...criteria.map((item, index) => headerCell(item.criterion, { width: widths[2 + index], fill: COLORS.bandDeep, size: 15 })),
    headerCell("Observaciones", { width: widths[widths.length - 1], fill: COLORS.bandDeep }),
  ], { header: true });
  const body = students.map((student, index) => row([
    cell(String(index + 1), { width: widths[0], align: AlignmentType.CENTER, size: 17 }),
    cell(student, { width: widths[1], size: 17 }),
    ...criteria.map((_, position) => cell("", { width: widths[2 + position] })),
    cell("", { width: widths[widths.length - 1] }),
  ]));
  return [
    bandTitle(`Instrumento de evaluación — ${content.instrument}`, { color: COLORS.bandDeep, pageBreakBefore: true }),
    spacer(60),
    table([row([cell(`Competencia: ${content.competencyLine || "________________"}`, { fill: COLORS.softBg, bold: true, size: 18 })])]),
    table([head, ...body], { widths }),
    new Paragraph({
      spacing: { before: 80 },
      children: [run("Escala: ", { bold: true, size: 17, color: COLORS.heading }), run("Lo logró (L) · En proceso (P) · Necesita ayuda (A)", { size: 17, color: COLORS.muted })],
    }),
  ];
}

function worksheetBlocks(content: SessionContent): Block[] {
  const blocks: Block[] = [
    bandTitle("Ficha de trabajo", { color: COLORS.bandNavy, pageBreakBefore: true, align: AlignmentType.CENTER, size: 26 }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: COLORS.softBg, type: "clear", color: "auto" },
      spacing: { after: 120 },
      children: [new TextRun({ text: `¡${clean(content.title)}!`, bold: true, color: COLORS.heading, size: 22, font: FONT_DISPLAY })],
    }),
    table([row([cell(`Nombre y apellidos: ______________________________________   Grado: ${content.info.find(([label]) => label === "Grado")?.[1] ?? "________"}   Fecha: ____ / ____ / ______`, { size: 18, fill: COLORS.warmBg, borderColor: COLORS.warmBorder })])]),
    spacer(80),
    table([row([
      cell([new Paragraph({ alignment: AlignmentType.CENTER, children: [inlineImage(WORKSHEET_ASSETS[0], 70, "Estudiantes")] })], { width: 16, noBorders: true, vAlign: VerticalAlign.CENTER }),
      cell(`📌 Lee con atención y responde las preguntas basándote en lo aprendido sobre ${clean(content.mindMap.center).toLocaleLowerCase("es")}.`, { width: 84, size: 19, fill: COLORS.warmBg, borderColor: COLORS.warmBorder, italics: true }),
    ])], { widths: [16, 84] }),
    spacer(80),
  ];
  const circled = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
  const palette = [COLORS.inicio, COLORS.desarrollo, COLORS.cierre, COLORS.teal, COLORS.bandDark];
  content.worksheet.forEach((item, index) => {
    const color = palette[index % palette.length];
    const type = item.type.toLocaleLowerCase("es");
    const paragraphs: Paragraph[] = [
      new Paragraph({
        spacing: { after: 60 },
        children: [run(`${circled[index] ?? `${index + 1}.`} `, { bold: true, color, size: 22 }), run(clean(item.prompt), { bold: true, size: 20 })],
      }),
    ];
    if (item.options.length) {
      item.options.forEach((option, position) => {
        const letter = String.fromCharCode(97 + position);
        paragraphs.push(new Paragraph({ indent: { left: 360 }, spacing: { after: 30 }, children: [run(`${letter}) `, { bold: true, color, size: 19 }), run(clean(option).replace(/^[a-d]\)\s*/i, ""), { size: 19 })] }));
      });
    } else if (/verdadero|falso/.test(type)) {
      paragraphs.push(new Paragraph({ indent: { left: 360 }, children: [run("☐ Verdadero     ☐ Falso", { size: 20 })] }));
    } else if (/completar/.test(type)) {
      paragraphs.push(new Paragraph({ indent: { left: 360 }, children: [run("Respuesta: ______________________________", { size: 19, color: COLORS.lines })] }));
    } else if (/dibuj|esquema|organizador/.test(type)) {
      paragraphs.push(...Array.from({ length: 6 }, () => new Paragraph({ children: [run(" ")], spacing: { after: 120 } })));
    } else if (/desarrollo|explica|argument/.test(type)) {
      paragraphs.push(...answerLines(4));
    } else {
      paragraphs.push(...answerLines(2));
    }
    blocks.push(card(paragraphs, { color }));
    blocks.push(spacer(60));
    if (index === 2 || index === 5) {
      const asset = WORKSHEET_ASSETS[(index === 2 ? 1 : 2) % WORKSHEET_ASSETS.length];
      blocks.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 40 }, children: [inlineImage(asset, 64, "Ilustración")] }));
    }
  });
  blocks.push(subTitle(`Elabora tu ${content.alignment.product ? clean(content.alignment.product).toLocaleLowerCase("es") : "organizador visual"}`, COLORS.bandNavy));
  blocks.push(drawingBox(9));
  blocks.push(spacer(100));
  blocks.push(new Paragraph({ spacing: { after: 60 }, children: [run("Marca con una X según cómo realizaste tu trabajo.", { bold: true, size: 19, color: COLORS.heading })] }));
  blocks.push(selfAssessmentTable(content.selfAssessment));
  blocks.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 80 }, children: [run(content.headerLine, { size: 15, color: COLORS.muted })] }));
  return blocks;
}

function theoryBlocks(content: SessionContent): Block[] {
  const blocks: Block[] = [bandTitle("Teoría del tema", { color: COLORS.bandDeep, pageBreakBefore: true }), spacer(60)];
  content.theory.forEach((block) => {
    blocks.push(subTitle(block.title, COLORS.bandDeep));
    blocks.push(...bodyParagraphs(block.narrative, { size: 20, accent: COLORS.bandDeep }));
    block.points.forEach((point) => blocks.push(checkLine(point, { size: 20, mark: "–", accent: COLORS.bandDeep })));
  });
  return blocks;
}

function mindMapBlocks(content: SessionContent): Block[] {
  if (!content.mindMap.branches.length) return [];
  return [
    bandTitle("Mapa mental · Infografía", { color: COLORS.bandNavy, pageBreakBefore: true, align: AlignmentType.CENTER }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [run(content.headerLine, { size: 17, color: COLORS.muted })],
    }),
    ...mindMap(content.mindMap.center, content.mindMap.branches),
  ];
}

export function buildSessionDocx(artifact: WorkflowArtifact, values: Record<string, unknown> = {}): Document {
  const content = readSessionContent(artifact, values);
  const children: Block[] = [...titleBlocks(content)];

  children.push(bandTitle("I. Datos informativos"));
  children.push(keyValueTable(content.info, { labelWidth: 30 }));

  children.push(bandTitle("II. Propósitos de aprendizaje del CNEB"));
  children.push(purposesTable(content));

  children.push(bandTitle("III. Alineamiento pedagógico de la sesión"));
  children.push(alignmentTable(content));

  children.push(bandTitle("IV. Necesidades de aprendizaje e instrumento"));
  children.push(labeledRowsTable([
    { label: "Necesidades de aprendizaje", text: content.needs || "________________", color: COLORS.bandTeal, check: true },
    { label: "Instrumento de evaluación", text: content.instrument, color: COLORS.bandTeal },
  ]));

  children.push(bandTitle("V. Enfoques transversales, DUA y trabajo entre pares"));
  const approachRows = content.approaches.length
    ? content.approaches.map((item) => ({ label: item.approach.replace(/^enfoque\s+(de\s+)?/i, "Enfoque de "), text: [item.value ? `Valor: ${item.value}` : "", item.attitude ? `Actitud: ${item.attitude}` : ""].filter(Boolean).join("\n") || "________________", color: COLORS.bandTeal }))
    : [{ label: "Enfoque transversal", text: "________________", color: COLORS.bandTeal }];
  children.push(labeledRowsTable([
    ...approachRows,
    { label: "Diseño Universal para el Aprendizaje (DUA) / Atención a la diversidad", text: content.duaContext || "________________", color: COLORS.bandDark },
    { label: "DUA según contexto", text: content.dua || "________________", color: COLORS.bandDark, check: true },
    { label: "Trabajo entre pares", text: content.peerWork || "Los estudiantes interactúan de manera colaborativa para movilizar capacidades y resolver el reto de la sesión, intercambiando estrategias y retroalimentándose mutuamente.", color: COLORS.bandDark },
  ], { labelWidth: 26 }));

  children.push(bandTitle("VI. Procesos pedagógicos y actividades"));
  children.push(momentsTable(content.moments.map((moment) => ({
    name: moment.name,
    minutes: moment.minutes,
    text: momentText(moment) || "________________",
  }))));

  children.push(bandTitle("VII. Evaluación de los aprendizajes"));
  children.push(evaluationTable(content));

  children.push(bandTitle("VIII. Soporte pedagógico y fuentes de consulta"));
  children.push(sourcesTable(content));

  content.extraSections.forEach((block) => {
    children.push(bandTitle(block.title, { color: COLORS.bandTeal }));
    children.push(...bodyParagraphs(block.narrative));
    block.points.forEach((point) => children.push(checkLine(point)));
  });

  if (artifact.teacher_recommendations?.length) {
    children.push(subTitle("Orientaciones para la revisión docente", COLORS.muted));
    artifact.teacher_recommendations.forEach((item) => children.push(checkLine(item, { size: 18, mark: "•", accent: COLORS.muted, color: COLORS.muted })));
  }

  children.push(signaturesBlock(content.signers));

  if (content.includeTheory) children.push(...theoryBlocks(content));
  children.push(...observationGuide(content));
  if (content.includeWorksheet) children.push(...worksheetBlocks(content));
  children.push(...mindMapBlocks(content));

  return new Document({
    styles: documentStyles,
    sections: [
      {
        properties: pageProperties("portrait"),
        headers: documentHeader({ headerRight: content.headerLine }),
        footers: documentFooter(`Sesión de aprendizaje · ${clean(content.title)}`),
        children,
      },
    ],
  });
}

export { cellParagraphs };
